import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../config/nodeMailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "sociofy-app" });

/* --------------------------- USER CREATED --------------------------- */
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    let username = email_addresses[0].email_address.split("@")[0];

    // Check username availability
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      username = username + Math.floor(Math.random() * 10000);
    }

    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
      username,
    });
  }
);

/* --------------------------- USER UPDATED --------------------------- */
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
    });
  }
);

/* --------------------------- USER DELETED --------------------------- */
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

/* ------------------- SEND CONNECTION REQUEST REMINDER ------------------- */
const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    // Initial Email
    await step.run("send-connection-request-mail", async () => {
      const conn = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );

      const subject = `New Connection Request`;
      const body = `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Hi ${conn.to_user_id.full_name},</h2>
          <p>You have a new connection request from 
          ${conn.from_user_id.full_name} (@${conn.from_user_id.username}).</p>
          <p><a href="${process.env.FRONTEND_URL}/connections">View request</a></p>
          <p>Thanks,<br/>Sociofy</p>
        </div>
      `;

      await sendEmail({
        to: conn.to_user_id.email,
        subject,
        body,
      });
    });

    // Wait 24 hours
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);

    // Reminder Email
    await step.run("send-connection-request-reminder", async () => {
      const conn = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );

      // Already accepted → no reminder
      if (conn.status === "accepted") return;

      const subject = `Reminder: You have a pending connection request`;
      const body = `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Hi ${conn.to_user_id.full_name},</h2>
          <p>You still have a pending request from 
          ${conn.from_user_id.full_name} (@${conn.from_user_id.username}).</p>
          <p><a href="${process.env.FRONTEND_URL}/connections">Respond now</a></p>
          <p>Thanks,<br/>Sociofy</p>
        </div>
      `;

      await sendEmail({
        to: conn.to_user_id.email,
        subject,
        body,
      });

      return { message: "Reminder sent" };
    });
  }
);

/* --------------------------- DELETE STORY AFTER 24 HRS --------------------------- */
const deleteStory = inngest.createFunction(
  { id: "story-delete" },
  { event: "app/story.delete" },
  async ({ event, step }) => {
    const { storyId } = event.data;

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);

    await step.run("delete-story", async () => {
      await Story.findByIdAndDelete(storyId);
      return { message: "Story deleted" };
    });
  }
);

/* --------- SEND DAILY NOTIFICATION ABOUT UNSEEN MESSAGES (CRON FIXED) --------- */
const SendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-unseen-messages-notification" },

  // FIXED: Correct cron (runs everyday at 9 AM New York time)
  { cron: "TZ=America/New_York 0 0 9 * * *" },

  async ({ step }) => {
    const messages = await Message.find({ seen: false }).populate("to_user_id");

    const unseenCount = {};

    messages.forEach((msg) => {
      unseenCount[msg.to_user_id._id] =
        (unseenCount[msg.to_user_id._id] || 0) + 1;
    });

    for (const userId in unseenCount) {
      const user = await User.findById(userId);

      const subject = `💬 You have ${unseenCount[userId]} unseen messages`;

      const body = `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Hi ${user.full_name},</h2>
          <p>You have ${unseenCount[userId]} unseen messages.</p>
          <p><a href="${process.env.FRONTEND_URL}/messages">Read messages</a></p>
          <p>Thanks,<br/>Sociofy</p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });
    }

    return { message: "Notifications sent" };
  }
);

/* --------------------------- EXPORT FUNCTIONS --------------------------- */
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  deleteStory,
  SendNotificationOfUnseenMessages,
];
