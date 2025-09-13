# Support Chatbot Feature

## Overview

The Support Chatbot is a personal assistant that helps users navigate the VirtualCFO platform. It provides contextual help about different sections and features of the application, guiding users to the right tools based on their queries.

## Implementation Details

### Components Created

1. **SupportChatbot Component** - A floating chat widget that appears in the bottom-right corner of the dashboard
2. **Knowledge Base** - An in-memory database of project information, sections, features, and FAQs

### Files Modified

1. `src/components/modern-dashboard.tsx` - Added SupportChatbot to the main dashboard layout
2. `src/components/dashboard.tsx` - Added SupportChatbot to the regular dashboard

### Files Created

1. `src/components/support-chatbot.tsx` - The main support chatbot component

## Features

### User Interface

1. **Floating Widget** - Appears in the bottom-right corner of the screen
2. **Toggle Visibility** - Users can open/close the chatbot with a single click
3. **Message History** - Shows conversation history with user and bot messages
4. **Voice Input** - Supports voice-to-text input for hands-free interaction
5. **Speech Output** - Optional text-to-speech for bot responses

### Functionality

1. **Contextual Help** - Provides information about different sections of the platform:

   - Overview
   - Daily Earnings
   - AI Assistant
   - Upload
   - Advanced
   - Reports
   - Insights
   - Business Trends
   - Profile
   - Contact
   - Settings

2. **Feature Information** - Explains key features:

   - Business Health
   - AI Insights
   - Document Processing
   - Notifications
   - Reporting

3. **FAQ Support** - Answers common questions:

   - How to record daily earnings
   - How to upload documents
   - How to view reports
   - How to contact support

4. **Conversation Flow** - Maintains a natural conversation with greetings, acknowledgments, and farewells

### Security

1. **Project-Specific** - Only answers questions related to the VirtualCFO platform
2. **No External Access** - Does not connect to external APIs or databases
3. **Client-Side Only** - All processing happens in the browser

## Technical Implementation

### Knowledge Base Structure

The chatbot uses a structured knowledge base organized into three categories:

1. Sections - Information about each dashboard section
2. Features - Details about key platform features
3. FAQs - Answers to common user questions

### Response Logic

The chatbot uses keyword matching to find relevant information:

1. Checks if user query contains section names
2. Looks for feature-related keywords
3. Matches against FAQ questions
4. Provides generic help if no specific match is found

### Voice Features

1. **Speech Recognition** - Uses Web Speech API for voice input
2. **Text-to-Speech** - Uses Web Speech API for voice output
3. **Language Support** - Currently supports English

## Integration

The SupportChatbot component is integrated into:

1. ModernDashboard - The main dashboard layout
2. Dashboard - The legacy dashboard component

This ensures the chatbot is available on all dashboard sections.

## Future Enhancements

1. **Enhanced NLP** - Implement more sophisticated natural language processing
2. **Personalization** - Customize responses based on user's business type and data
3. **Multilingual Support** - Add support for Hindi and other regional languages
4. **Context Awareness** - Make the chatbot aware of which section the user is currently viewing
5. **Analytics** - Track common questions to improve the knowledge base
6. **Backend Integration** - Connect to a backend service for more dynamic responses

## How to Test

1. Navigate to the dashboard
2. Click the chat icon in the bottom-right corner
3. Ask questions about different sections of the platform
4. Test voice input functionality
5. Toggle speech output on/off
6. Verify that the chatbot only answers project-related questions

## Customization

To update the knowledge base:

1. Modify the `projectKnowledgeBase` object in `src/components/support-chatbot.tsx`
2. Add new sections, features, or FAQs as needed
3. Update response logic in the `findRelevantInfo` function

## Browser Support

The Support Chatbot uses modern web APIs:

- Web Speech API for voice features
- CSS Grid and Flexbox for layout
- Modern JavaScript features

It works best in Chrome, Edge, and other Chromium-based browsers. Voice features may be limited in other browsers.
