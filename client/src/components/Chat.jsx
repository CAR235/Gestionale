import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';

function Chat({ projectId, taskId, type = 'project' }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchTeamMembers();
  }, [projectId, taskId]);

  const fetchMessages = async () => {
    try {
      const endpoint = type === 'project' 
        ? `/api/projects/${projectId}/messages`
        : `/api/tasks/${taskId}/messages`;
      const response = await axios.get(endpoint);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/api/team-members');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const endpoint = type === 'project'
        ? `/api/projects/${projectId}/messages`
        : `/api/tasks/${taskId}/messages`;

      const messageData = {
        content: newMessage,
        mentioned_users: mentionedUsers.map(user => user.id)
      };

      await axios.post(endpoint, messageData);
      setNewMessage('');
      setMentionedUsers([]);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle @mentions
    const lastWord = value.split(' ').pop();
    if (lastWord.startsWith('@')) {
      const username = lastWord.slice(1);
      const mentioned = teamMembers.find(member => 
        member.name.toLowerCase().includes(username.toLowerCase())
      );
      if (mentioned && !mentionedUsers.find(u => u.id === mentioned.id)) {
        setMentionedUsers([...mentionedUsers, mentioned]);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              alignItems="flex-start"
              secondaryAction={
                <IconButton edge="end" onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar>{message.user_name[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography component="div">
                    <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      {message.user_name}
                    </Box>
                    <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {formatTimestamp(message.created_at)}
                    </Box>
                  </Typography>
                }
                secondary={
                  <Typography
                    component="div"
                    variant="body2"
                    color="text.primary"
                  >
                    {message.content}
                  </Typography>
                }
              />
              <Divider variant="inset" component="li" />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        {mentionedUsers.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {mentionedUsers.map((user) => (
              <Chip
                key={user.id}
                label={`@${user.name}`}
                size="small"
                onDelete={() => setMentionedUsers(mentionedUsers.filter(u => u.id !== user.id))}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
        <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
        <MenuItem onClick={handleMenuClose}>Reply</MenuItem>
      </Menu>
    </Paper>
  );
}

export default Chat;