import React, { useState, useMemo } from 'react';

export default function App() {
  // Navigation State: 'tracker' or 'emails'
  const [activeTab, setActiveTab] = useState('tracker');

  // Application Tracker State
  const [applications, setApplications] = useState([
    {
      id: 1,
      company: 'Stripe',
      role: 'Frontend Engineer',
      status: 'Approved',
      source: 'LinkedIn',
      dateAdded: '2026-10-01',
      notes: 'Passed technical interview round.',
    },
    {
      id: 2,
      company: 'Figma',
      role: 'UI/UX Engineer',
      status: 'Pending',
      source: 'Handshake',
      dateAdded: '2026-10-05',
      notes: 'Submitted portfolio, waiting for recruiter call.',
    },
    {
      id: 3,
      company: 'Vercel',
      role: 'Product Designer',
      status: 'Rejected',
      source: 'LinkedIn',
      dateAdded: '2026-09-28',
      notes: 'Role filled internally.',
    },
  ]);

  // Processed Emails Archive State
  const [emailArchive, setEmailArchive] = useState([
    {
      id: 101,
      subject: 'Interview Invitation: Technical Screening',
      sender: 'recruiting@stripe.com',
      category: 'Urgent (Work)',
      date: '2026-10-01',
      snippet: 'We would love to invite you to a 45-minute technical screen...',
    },
    {
      id: 102,
      subject: 'Your Amazon.com order #114-892341',
      sender: 'auto-confirm@amazon.com',
      category: 'Shopping',
      date: '2026-10-06',
      snippet: 'Your order containing Wireless Headphones has been shipped...',
    },
    {
      id: 103,
      subject: 'Your Uber Eats order from Chipotle',
      sender: 'orders@ubereats.com',
      category: 'Food / Delivery',
      date: '2026-10-08',
      snippet: 'Your driver is on the way with your order from Chipotle...',
    },
  ]);

  // Undo System State
  const [lastDeletedItem, setLastDeletedItem] = useState(null); // { type: 'app' | 'email', item, index }
  const [undoBannerMessage, setUndoBannerMessage] = useState('');

  // Add Application Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Pending',
    source: 'LinkedIn',
    notes: '',
  });

  // Email Parser Input State
  const [rawEmail, setRawEmail] = useState('');
  const [parsedResult, setParsedResult] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Computed Metrics
  const metrics = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'Pending').length;
    const approved = applications.filter((a) => a.status === 'Approved').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [applications]);

  // Filtered Applications Table
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.source.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        statusFilter === 'All' || app.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, searchQuery, statusFilter]);

  // Handlers for Applications
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddApplication = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    const newApp = {
      id: Date.now(),
      company: formData.company,
      role: formData.role,
      status: formData.status,
      source: formData.source,
      dateAdded: new Date().toISOString().split('T')[0],
      notes: formData.notes,
    };

    setApplications([newApp, ...applications]);
    setFormData({
      company: '',
      role: '',
      status: 'Pending',
      source: 'LinkedIn',
      notes: '',
    });
    setIsFormOpen(false);
  };

  const handleStatusChange = (id, newStatus) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  // Delete Application with Undo
  const handleDeleteApplication = (id) => {
    const index = applications.findIndex((app) => app.id === id);
    if (index === -1) return;

    const itemToDelete = applications[index];
    setLastDeletedItem({ type: 'app', item: itemToDelete, index });
    setUndoBannerMessage(`Deleted application for ${itemToDelete.company}.`);

    setApplications(applications.filter((app) => app.id !== id));
  };

  // Delete Email from Archive with Undo
  const handleDeleteEmail = (id) => {
    const index = emailArchive.findIndex((email) => email.id === id);
    if (index === -1) return;

    const itemToDelete = emailArchive[index];
    setLastDeletedItem({ type: 'email', item: itemToDelete, index });
    setUndoBannerMessage(
      `Deleted email "${itemToDelete.subject.slice(0, 30)}..." from Archive.`
    );

    setEmailArchive(emailArchive.filter((email) => email.id !== id));
  };

  // Restore Last Deleted Item
  const handleUndoDelete = () => {
    if (!lastDeletedItem) return;

    if (lastDeletedItem.type === 'app') {
      const updated = [...applications];
      updated.splice(lastDeletedItem.index, 0, lastDeletedItem.item);
      setApplications(updated);
    } else if (lastDeletedItem.type === 'email') {
      const updated = [...emailArchive];
      updated.splice(lastDeletedItem.index, 0, lastDeletedItem.item);
      setEmailArchive(updated);
    }

    setLastDeletedItem(null);
    setUndoBannerMessage('');
  };

  // Rule-based Email Classifier & Router
  const parseEmailText = () => {
    if (!rawEmail.trim()) return;

    const text = rawEmail.toLowerCase();

    let emailCategory = 'General Work';
    let isJobEmail = false;

    if (
      text.includes('interview') ||
      text.includes('calendly') ||
      text.includes('technical screen') ||
      text.includes('offer') ||
      text.includes('application received') ||
      text.includes('recruiting') ||
      text.includes('candidate') ||
      text.includes('unfortunately')
    ) {
      emailCategory = 'Urgent (Work)';
      isJobEmail = true;
    } else if (
      text.includes('amazon') ||
      text.includes('order') ||
      text.includes('receipt') ||
      text.includes('shipping')
    ) {
      emailCategory = 'Shopping';
    } else if (
      text.includes('ubereats') ||
      text.includes('doordash') ||
      text.includes('chipotle') ||
      text.includes('food')
    ) {
      emailCategory = 'Food / Delivery';
    } else if (
      text.includes('uber ride') ||
      text.includes('lyft') ||
      text.includes('flight') ||
      text.includes('hotel')
    ) {
      emailCategory = 'Travel / Rides';
    } else if (
      text.includes('newsletter') ||
      text.includes('unsubscribe') ||
      text.includes('digest')
    ) {
      emailCategory = 'Newsletters/Marketing';
    }

    let extractedStatus = 'Pending';
    if (
      text.includes('invite') ||
      text.includes('congratulations') ||
      text.includes('offer') ||
      text.includes('calendly.com')
    ) {
      extractedStatus = 'Approved';
    } else if (
      text.includes('unfortunately') ||
      text.includes('other candidates') ||
      text.includes('not moving forward')
    ) {
      extractedStatus = 'Rejected';
    }

    let extractedCompany = 'Personal / Retailer';
    if (text.includes('stripe')) extractedCompany = 'Stripe';
    else if (text.includes('figma')) extractedCompany = 'Figma';
    else if (text.includes('vercel')) extractedCompany = 'Vercel';
    else if (text.includes('notion')) extractedCompany = 'Notion';
    else if (text.includes('airbnb')) extractedCompany = 'Airbnb';
    else if (text.includes('google')) extractedCompany = 'Google';

    let extractedRole = 'Software Engineer Intern';
    if (text.includes('frontend')) extractedRole = 'Frontend Engineer';
    else if (text.includes('backend')) extractedRole = 'Backend Engineer';
    else if (text.includes('designer') || text.includes('ui/ux'))
      extractedRole = 'UI/UX Designer';

    setParsedResult({
      emailCategory,
      isJobEmail,
      company: extractedCompany,
      role: isJobEmail ? extractedRole : 'N/A',
      status: isJobEmail ? extractedStatus : 'N/A',
      source: 'Email Sync',
      snippet: rawEmail.slice(0, 85) + '...',
      notes: isJobEmail
        ? `Auto-routed to Interview Tracker (${extractedStatus} status)`
        : `Stored in Inbox Archive under ${emailCategory}`,
    });
  };

  // Sync Processed Email to System
  const applyParsedToSystem = () => {
    if (!parsedResult) return;

    const newEmailArchiveEntry = {
      id: Date.now(),
      subject: parsedResult.isJobEmail
        ? `Recruiter Update from ${parsedResult.company}`
        : `Order/Update (${parsedResult.emailCategory})`,
      sender: 'parsed-email@inbox.com',
      category: parsedResult.emailCategory,
      date: new Date().toISOString().split('T')[0],
      snippet: parsedResult.snippet,
    };

    setEmailArchive([newEmailArchiveEntry, ...emailArchive]);

    if (parsedResult.isJobEmail) {
      const existingIndex = applications.findIndex(
        (a) => a.company.toLowerCase() === parsedResult.company.toLowerCase()
      );

      if (existingIndex >= 0) {
        const updated = [...applications];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: parsedResult.status,
          notes: parsedResult.notes,
        };
        setApplications(updated);
      } else {
        const newEntry = {
          id: Date.now(),
          company: parsedResult.company,
          role: parsedResult.role,
          status: parsedResult.status,
          source: 'Email Auto-Route',
          dateAdded: new Date().toISOString().split('T')[0],
          notes: parsedResult.notes,
        };
        setApplications([newEntry, ...applications]);
      }
    }

    setRawEmail('');
    setParsedResult(null);
  };

  // Badge Styling Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Urgent (Work)':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'Shopping':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
      case 'Food / Delivery':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Travel / Rides':
        return 'bg-teal-100 text-teal-800 border-teal-300 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased font-sans pb-24">
      <div className="h-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 w-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header Block & Navigation Tabs */}
        <header className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Smart Workspace Hub
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Classify incoming emails and auto-route job/interview updates
                  directly to your tracker.
                </p>
              </div>
            </div>

            {activeTab === 'tracker' && (
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Application
              </button>
            )}
          </div>

          {/* Integrated Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tracker'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Interview Tracker
              <span className="ml-1 px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-full text-xs font-bold">
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'emails'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email Inbox & Sorter
              <span className="ml-1 px-2 py-0.5 bg-violet-200 text-violet-900 rounded-full text-xs font-bold">
                {emailArchive.length}
              </span>
            </button>
          </div>
        </header>

        {/* TAB 1: INTERVIEW TRACKER */}
        {activeTab === 'tracker' && (
          <div>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Total Applications
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {metrics.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                    In Review
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {metrics.pending}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                    Approved Offers
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {metrics.approved}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Add Application Form */}
            {isFormOpen && (
              <div className="mb-8 p-6 bg-white rounded-2xl border border-indigo-100 shadow-md">
                <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  New Application Details
                </h2>
                <form onSubmit={handleAddApplication} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        required
                        placeholder="e.g. Stripe"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Role Title
                      </label>
                      <input
                        type="text"
                        name="role"
                        required
                        placeholder="e.g. Frontend Developer"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Initial Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Source Portal
                      </label>
                      <select
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none"
                      >
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Handshake">Handshake</option>
                        <option value="Company Website">Company Website</option>
                        <option value="Referral">Referral</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="e.g. Follow up with recruiter"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
                    >
                      Save Application
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Applications Table Block */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Search company or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        statusFilter === status
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-5">Company</th>
                      <th className="py-3.5 px-5">Role</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Source</th>
                      <th className="py-3.5 px-5">Date Added</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">
                              {app.company}
                            </div>
                            {app.notes && (
                              <div className="text-xs text-slate-400 font-normal truncate max-w-xs mt-0.5">
                                {app.notes}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-5 text-slate-600 font-medium">
                            {app.role}
                          </td>

                          <td className="py-4 px-5">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(app.id, e.target.value)
                              }
                              className={`text-xs px-3 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none ${getStatusBadge(
                                app.status
                              )}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>

                          <td className="py-4 px-5">
                            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg border font-medium bg-slate-100 text-slate-700 border-slate-200">
                              {app.source}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-slate-400 text-xs font-mono">
                            {app.dateAdded}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete application"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-12 text-center text-slate-400"
                        >
                          No applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMAIL INBOX & SORTER */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            {/* Parser Input Box */}
            <div className="p-6 bg-white rounded-2xl border border-violet-200 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="p-1.5 bg-violet-100 rounded-lg text-violet-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                Classify & Route Incoming Emails
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Paste recruiter emails or personal receipts. Job and interview
                emails are automatically routed into the Interview Tracker tab.
              </p>

              <div className="space-y-4">
                <textarea
                  rows="4"
                  placeholder="Paste email text here (e.g., Stripe interview invitation or Uber Eats order confirmation)..."
                  value={rawEmail}
                  onChange={(e) => setRawEmail(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-violet-500"
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={parseEmailText}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Classify Email
                  </button>
                </div>

                {parsedResult && (
                  <div className="p-4 bg-violet-50/80 border border-violet-200 rounded-xl space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-800">
                        Detected Category
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs border ${getCategoryBadge(
                          parsedResult.emailCategory
                        )}`}
                      >
                        {parsedResult.emailCategory}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 border-t border-violet-200/80 pt-3">
                      <div>
                        <span className="font-semibold text-slate-900">
                          Entity:
                        </span>{' '}
                        {parsedResult.company}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          Auto-Routing:
                        </span>{' '}
                        {parsedResult.isJobEmail ? (
                          <span className="text-emerald-700 font-bold">
                            Interview Tracker
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">
                            Inbox Archive Only
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-slate-900">
                          Summary:
                        </span>{' '}
                        {parsedResult.notes}
                      </div>
                    </div>

                    <button
                      onClick={applyParsedToSystem}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      {parsedResult.isJobEmail
                        ? 'Confirm & Auto-Route to Interview Tracker'
                        : 'Confirm & Save to Inbox Archive'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Email Inbox Archive List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">
                  Processed Email Inbox Archive
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {emailArchive.length} Messages Logged
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {emailArchive.length > 0 ? (
                  emailArchive.map((email) => (
                    <div
                      key={email.id}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {email.subject}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs border whitespace-nowrap ${getCategoryBadge(
                              email.category
                            )}`}
                          >
                            {email.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {email.snippet}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs text-slate-400 font-mono hidden sm:block">
                          <div>{email.date}</div>
                          <div>{email.sender}</div>
                        </div>

                        {/* Delete Email Button */}
                        <button
                          onClick={() => handleDeleteEmail(email.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete archived email"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No emails logged in archive.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Undo Notification Banner */}
      {lastDeletedItem && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-4 animate-bounce-short">
          <div className="text-sm">
            <span>{undoBannerMessage}</span>
          </div>
          <button
            onClick={handleUndoDelete}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
          >
            Undo
          </button>
          <button
            onClick={() => setLastDeletedItem(null)}
            className="text-slate-400 hover:text-white text-xs ml-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
