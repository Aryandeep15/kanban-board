import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]); // State to store users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grouping, setGrouping] = useState('status'); // Default grouping by status
  const [sorting, setSorting] = useState('priority'); // Default sorting by priority
  const [isDropdownOpen, setDropdownOpen] = useState(false); // State to toggle dropdown visibility

  const priorityLabels = {
    0: 'No Priority',
    1: 'Urgent',
    2: 'High Priority',
    3: 'Medium Priority',
    4: 'Low Priority',
  };

  const priorityIcons = {
    0: "/icons_FEtask/No-priority.svg",
    1: "/icons_FEtask/SVG - Urgent Priority colour.svg",
    2: "/icons_FEtask/Img - High Priority.svg",
    3: "/icons_FEtask/Img - Medium Priority.svg",
    4: "/icons_FEtask/Img - Low Priority.svg",
  };

  // Define the status labels and icons
  const statusLabels = {
    'todo': 'To-Do',
    'in-progress': 'In Progress',
    'backlog': 'Backlog',
    'done': 'Done',
    'cancelled': 'Cancelled'
  };

  const statusIcons = {
    'todo': "/icons_FEtask/To-do.svg",
    'in-progress': "/icons_FEtask/in-progress.svg",
    'backlog': "/icons_FEtask/Backlog.svg",
    'done': "/icons_FEtask/Done.svg",
    'cancelled': "/icons_FEtask/Cancelled.svg"
  };

  // Define all the possible statuses
  const allStatuses = ['todo', 'in-progress', 'backlog', 'done', 'cancelled'];

  // Helper function to normalize status values returned from the API
  const normalizeStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'todo':
        return 'todo';
      case 'in progress':
        return 'in-progress';
      case 'backlog':
        return 'backlog';
      case 'done':
        return 'done';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'backlog'; // Default to 'backlog' for unknown statuses
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        
        const normalizedTickets = response.data.tickets.map(ticket => ({
          ...ticket,
          status: normalizeStatus(ticket.status)
        }));

        setTickets(normalizedTickets);
        setUsers(response.data.users); // Store users data
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to get user name by user ID
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId; // Return the name if found, otherwise return the userId
  };

  // Function to group tickets based on the selected grouping (priority, status, or user)
  const getGroupedTickets = () => {
    if (grouping === 'priority') {
      const priorities = {};
      tickets.forEach((ticket) => {
        const priority = ticket.priority;
        if (!priorities[priority]) {
          priorities[priority] = [];
        }
        priorities[priority].push(ticket);
      });
      return priorities;
    } else if (grouping === 'status') {
      const statuses = {};
      tickets.forEach((ticket) => {
        const status = ticket.status;
        if (!statuses[status]) {
          statuses[status] = [];
        }
        statuses[status].push(ticket);
      });
      // Ensure all statuses are displayed, even if they have no tickets
      allStatuses.forEach((status) => {
        if (!statuses[status]) {
          statuses[status] = [];
        }
      });
      return statuses;
    } else if (grouping === 'user') {
      const usersGrouped = {};
      tickets.forEach((ticket) => {
        const user = ticket.userId;
        if (!usersGrouped[user]) {
          usersGrouped[user] = [];
        }
        usersGrouped[user].push(ticket);
      });
      return usersGrouped;
    }
  };

  // Function to sort the tickets based on selected sorting
  const getSortedTickets = (ticketsToSort) => {
    if (sorting === 'priority') {
      return [...ticketsToSort].sort((a, b) => b.priority - a.priority); // Highest to lowest priority
    } else if (sorting === 'title') {
      return [...ticketsToSort].sort((a, b) => a.title.localeCompare(b.title)); // Alphabetical sorting
    }
    return ticketsToSort;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const groupedTickets = getGroupedTickets(); // Grouped tickets based on the selected grouping

  return (
    <div className="kanban-board">
      {/* NavBar */}
      <div className="navbar">
        <div className="nav-left">
          <button className="display-btn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
            <img src="/icons_FEtask/Display.svg" alt="Display" /> Display
          </button>
          {isDropdownOpen && (
            <div className="dropdown">
              <label>
                Grouping:
                <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="user">User</option>
                </select>
              </label>
              <label>
                Ordering:
                <select value={sorting} onChange={(e) => setSorting(e.target.value)}>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </label>
            </div>
          )}
        </div>
        {/* Add button with icon */}
        <div className="nav-right">
          <img src="/icons_FEtask/add.svg" alt="Add" />
        </div>
      </div>

      {/* Kanban Container */}
      <div className="kanban-container">
        {Object.entries(groupedTickets).map(([group, ticketsInGroup]) => (
          <div key={group} className="kanban-column">
            <h2>
              {/* Show status icon and task count (for status grouping) */}
              {grouping === 'status' && statusIcons[group] && (
                <img src={statusIcons[group]} alt={statusLabels[group]} className="status-icon" />
              )}
              {grouping === 'priority' && priorityIcons[group] && (
                <img src={priorityIcons[group]} alt={priorityLabels[group]} className="priority-icon" />
              )}
              {/* For user grouping, show the actual user name */}
              {grouping === 'user' ? getUserName(group) : (statusLabels[group] || priorityLabels[group] || group)} ({ticketsInGroup.length})
            </h2>
            {getSortedTickets(ticketsInGroup).map((ticket) => (
              <div key={ticket.id} className="kanban-card">
                <div className="kanban-card-header">
                  <span className="ticket-id">{ticket.id}</span>
                  {/* Show status icon next to title when grouping by priority or user */}
                  {(grouping === 'priority' || grouping === 'user') && statusIcons[ticket.status] && (
                    <img src={statusIcons[ticket.status]} alt={statusLabels[ticket.status]} className="status-icon" />
                  )}
                </div>
                <h3 className="ticket-title">{ticket.title}</h3>
                <div className="ticket-tag">
                  {/* Show priority icon next to "Feature Request" when grouping by status or user */}
                  {(grouping === 'status' || grouping === 'user') && priorityIcons[ticket.priority] && (
                    <img
                      src={priorityIcons[ticket.priority]}
                      alt={priorityLabels[ticket.priority]}
                      className="priority-icon"
                    />
                  )}
                  <span>{ticket.tag[0]}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
