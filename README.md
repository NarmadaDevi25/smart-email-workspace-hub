# Smart Email Workspace Hub

An all-in-one productivity dashboard built with **React** and **Tailwind CSS** that combines an intelligent email classifier/sorter with an automated job interview tracker.

---

## 🚀 Features

* **Smart Email Classifier & Auto-Router:** Paste raw recruiter emails or everyday personal receipts (Shopping, Food/Delivery, Travel), and the rule-based engine automatically categorizes them.
* **Seamless Pipeline Integration:** Job and interview-related emails are automatically routed straight into the **Interview Tracker** tab, updating status metrics (Pending, Approved, Rejected) in real-time.
* **Email Inbox Archive:** Keeps a searchable, clean archive of all processed personal and professional emails with individual delete and undo actions.
* **Interactive Interview Pipeline:** Track application sources (LinkedIn, Handshake, Company Website), update application statuses instantly, and filter or search records dynamically.
* **Global Undo Functionality:** Features a floating notification banner allowing you to instantly restore deleted applications or archived emails.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** Tailwind CSS
* **State Management:** React Hooks (`useState`, `useMemo`)

---

## 📦 Getting Started Locally

1. Clone or download the repository to your local machine.
2. Install dependencies:
3.Run the development server:
   ```bash
   npm run dev
   
4.Open your browser and navigate to http://localhost:5173.

💡 How to Use
1.Test the Email Sorter: Go to the Email Inbox & Sorter tab, paste a sample recruiter email (e.g., Stripe Interview Invitation) or a personal delivery receipt, and click Classify Email.

2.Auto-Route to Tracker: Hit Confirm & Auto-Route to instantly log the message in your archive and watch job applications populate the Interview Tracker tab automatically.

3.Manage Pipeline: Switch to the Interview Tracker tab to update interview statuses, search applications, or filter by status.
