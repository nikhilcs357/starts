import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js"; 
import sendEmail from "../config/nodeMailer.js";


// Create a client to send and receive events
export const inngest = new Inngest({ id: "sociofy-app" });

// inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    let username = email_addresses[0].email_address.split("@")[0];

    // Check availability of username
    const existingUser = await User.findOne({ username }); 

    if (existingUser) {
      username = username + Math.floor(Math.random() * 10000);
    }

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username,
    };

    await User.create(userData); 
  }
);

// inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const updatedUserData = {
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name, 
      profile_picture: image_url,
    };

    await User.findByIdAndUpdate(id, updatedUserData); 
  }
);

// inngest function to delete user data to a database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" }, 
  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id); // ✅ FIXED: added missing argument
  }
);

// inngest function to send remainder when a new connection request is added
const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder"},
  { event: "app/connection-request"},
  async({ event, step }) => {
    const { connectionId } = event.data;
 
    await step.run('send-connection-request-mail', async () => {
      const conn = await Connection.findById(connectionId).populate('from_user_id to_user_id'); // ✅ FIXED variable name

      const subject = `New Connection Request`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${conn.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${conn.from_user_id.full_name}
         - @${conn.from_user_id.username}</p>
         <p>Click <a href="${process.env.FRONTEND_URL}/connections">here</a> to view it.</p>
         <p>Thanks.<br/>Sociofy - Stay Connected</p>
      </div>`; // ✅ FIXED missing quotes and tag closes

      await sendEmail({
        to: conn.to_user_id.email,
        subject,
        body,
      });
    });

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);

    await step.run('send-connection-request-reminder', async () => {
      const conn = await Connection.findById(connectionId).populate('from_user_id to_user_id'); // ✅ FIXED variable name again

      if (conn.status === "accepted") {
        return { message: "Already accepted" };
      }

      const subject = `New Connection Request Reminder`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${conn.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${conn.from_user_id.full_name}
         - @${conn.from_user_id.username}</p>
         <p>Click <a href="${process.env.FRONTEND_URL}/connections">here</a> to respond.</p>
         <p>Thanks.<br/>Sociofy - Stay Connected</p>
      </div>`; // ✅ FIXED formatting

      await sendEmail({
        to: conn.to_user_id.email,
        subject,
        body,
      });

      return { message: "Reminder sent." };
    });
  }
); 

//  Export all functions
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder
];
