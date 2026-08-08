# Web Development Project - _PicklePulse_

Author: **Nam Nguyen**

Netlify URL: https://bejewelled-treacle-8ea4ee.netlify.app/

This web app: **PicklePulse is a pickleball community forum where users can sign up/log in, create posts, upload local images or use image URLs, set post flags (General/Question/Opinion), browse and filter the home feed, and interact through upvotes, comments, editing, and deleting their own posts.**

## Features in the app:

- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the _option_ for users to add:
    - additional textual content
    - an image added as an external image URL
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    - creation time
    - upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page.
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page
- [x] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
- [x] Users can add more characterics to their posts
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [x] Web app displays a loading animation whenever data is being fetched
      
- [x] Full Supabase authentication flow (login, signup, logout, forgot password, reset password, Google OAuth)
- [x] Deployment the app to Netlify, here is the netlify url: https://bejewelled-treacle-8ea4ee.netlify.app/
- [x] Users can have an LLM (Gemini) to provide an overall summary of Post. The LLM provides title, description, posts, upvotes, comments, and a summary.

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img width="1280" height="720" alt="final_project" src="https://github.com/user-attachments/assets/65fccaf0-ac4a-407b-a9d8-610edb1f1558" />

<img width="1280" height="676" alt="canvas_submission" src="https://github.com/user-attachments/assets/71deeb67-3195-4b87-8e7c-20f4f8dba8fc" />

## Notes

Main challenges were connecting all frontend flows to Supabase (Auth, Posts, Comments, and Storage) while keeping UI state smooth.
The trickiest parts were handling silent vs. visible loading states in different interactions (initial load vs. sort/filter/upvote), and refining layout consistency across Home, Create, and Post pages.


## License

    Copyright [2026] [Nam Nguyen]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
