import fs from 'fs'
import imagekit from '../config/imagekit.js';
import Message from '../models/Message.js';




// create an empty object to store SS Event Connections
const connections = {};


// Controller Function for the SSE endpoint 
export const sseController = (req, res) => {
    const { userId } = req.params
    console.log('new Client connected :', userId)

    // set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Controle', 'no-cache');
    res.setHeader('Connection', 'kepp-alive');
    res.setHeader('Access-Control-Allow-Orgin', '*');

    //add the clients  response object to the connection object
    connections[userId] = res

    // send an intial event to the client
    res.write('log: connected to SSE stream\n\n');

    // Handle client disconnection
    req.on('close', () => {
        // remove the clients response object from the connection array
        delete connections[userId];
        console.log('client disconnected')
    })
}

// send message

export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { to_user_id, text } = req.body;
        const image = req.file;

        let media_url = '';
        let message_type = image ? 'image' : 'text';

        if (message_type === 'image') {
            const fileBuffer = fs.readFileSync(image.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: image.originalname,
            });
            media_url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            })
        }
        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        })
        res.json({ success: true, message });

        // send message to_user_id using SSE

        const messageWithUserData = await Message.findById(message._id).populate
            ('from_user_id');

        if (connections[to_user_id]) {
            connections[to_user_id].write(`data: ${JSON.stringify
                (messageWithUserData)}\n\n`)
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });

    }
}

// get chat Messages

export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { to_user_id } = req.body

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId },
            ]
        }).sort({ created_at: -1 })
        // mark messages as seen
        await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true })

        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const messages = await Message.find({ to_user_id: userId }).populate('from_user_id to_user_id').sort({ created_at: -1 });

        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

export const getConversations = async (req, res) => {
    try {
        const { userId } = req.auth;
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ from_user_id: userId }, { to_user_id: userId }]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$from_user_id", userId] },
                            then: "$to_user_id",
                            else: "$from_user_id"
                        }
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" }
        ]);
        res.json({ success: true, conversations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


