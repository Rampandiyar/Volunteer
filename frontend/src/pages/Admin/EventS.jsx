import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import { createEvent, getAllEvents, updateEvent, deleteEvent } from "../../api";

const EventS = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
  });
  const [editingEvent, setEditingEvent] = useState({
    event_id: null,
    event_name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events from the backend on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch events.");
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const openAddDialog = () => {
    setNewEvent({
      event_name: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (event) => {
    setEditingEvent({
      event_id: event.event_id, // Make sure to use the correct property name for the ID
      event_name: event.event_name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
    });
    setIsEditDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleAddEvent = async () => {
    if (!newEvent.event_name || !newEvent.startDate || !newEvent.endDate) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const eventData = {
        event_name: newEvent.event_name,
        description: newEvent.description,
        start_date: newEvent.startDate,
        end_date: newEvent.endDate,
        location: newEvent.location,
      };

      await createEvent(eventData);
      fetchEvents();
      closeAddDialog();
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    }
  };

  const handleUpdateEvent = async () => {
    if (
      !editingEvent.event_name ||
      !editingEvent.startDate ||
      !editingEvent.endDate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const eventData = {
        event_name: editingEvent.event_name,
        description: editingEvent.description,
        start_date: editingEvent.startDate,
        end_date: editingEvent.endDate,
        location: editingEvent.location,
      };

      await updateEvent(editingEvent.event_id, eventData);
      fetchEvents();
      closeEditDialog();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold">Event Management</h1>
          <p className="text-lg text-indigo-200">
            Manage events effectively and efficiently
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full md:w-1/3 px-4 py-2 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={openAddDialog}
            className="mt-4 md:mt-0 ml-0 md:ml-4 bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Add Event
          </Button>
        </div>

        {/* Loading and Error Messages */}
        {loading && <p className="text-center">Loading events...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Event Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-indigo-600 text-left text-white">
                {[
                  "Event Name",
                  "Description",
                  "Start Date",
                  "End Date",
                  "Location",
                  "Actions",
                ].map((header) => (
                  <th key={header} className="py-3 px-4 uppercase font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <motion.tr
                  key={event.event_id}
                  whileHover={{ scale: 1.02 }}
                  className="border-b border-white/20 hover:bg-indigo-800 transition duration-200"
                >
                  <td className="py-3 px-4">{event.event_name}</td>
                  <td className="py-3 px-4 truncate max-w-xs">
                    {event.description}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(event.end_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">{event.location}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Button
                      onClick={() => openEditDialog(event)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(event.event_id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={closeAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="pb-2">Add Event</DialogTitle>
        <DialogContent className="max-h-96 overflow-y-auto pt-2">
          <div className="grid grid-cols-1 gap-4 mt-6">
            <TextField
              label="Event Name"
              value={newEvent.event_name}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, event_name: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="Start Date"
              type="date"
              value={newEvent.startDate}
              onChange={(e) =>
                setNewEvent((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="End Date"
              type="date"
              value={newEvent.endDate}
              onChange={(e) =>
                setNewEvent((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Location"
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeAddDialog}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddEvent}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={closeEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="pb-2">Edit Event</DialogTitle>
        <DialogContent className="max-h-96 overflow-y-auto pt-2">
          <div className="grid grid-cols-1 gap-4 mt-6">
            <TextField
              label="Event Name"
              value={editingEvent.event_name}
              onChange={(e) =>
                setEditingEvent((prev) => ({
                  ...prev,
                  event_name: e.target.value,
                }))
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={editingEvent.description}
              onChange={(e) =>
                setEditingEvent((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="Start Date"
              type="date"
              value={editingEvent.startDate}
              onChange={(e) =>
                setEditingEvent((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="End Date"
              type="date"
              value={editingEvent.endDate}
              onChange={(e) =>
                setEditingEvent((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Location"
              value={editingEvent.location}
              onChange={(e) =>
                setEditingEvent((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeEditDialog}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateEvent}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventS;
