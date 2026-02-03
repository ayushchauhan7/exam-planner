import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  LayoutList,
} from "lucide-react";

// Configure base URL (Change for production)
const API_URL = "http://localhost:5000/api";

export default function App() {
  const [view, setView] = useState("allocate"); // 'allocate' or 'manage'
  const [classrooms, setClassrooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: "",
    capacity: "",
    floorNo: "",
    nearWashroom: false,
  });
  const [studentCount, setStudentCount] = useState("");
  const [allocationResult, setAllocationResult] = useState(null);
  const [error, setError] = useState("");

  // Fetch Classrooms [cite: 27]
  const fetchClassrooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/classrooms`);
      setClassrooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadClassrooms = async () => {
      try {
        const res = await axios.get(`${API_URL}/classrooms`);
        if (isMounted) setClassrooms(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadClassrooms();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Add Classroom [cite: 24]
  const handleAddClassroom = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/classrooms`, formData);
      setFormData({
        roomId: "",
        capacity: "",
        floorNo: "",
        nearWashroom: false,
      });
      fetchClassrooms();
      alert("Classroom Added Successfully");
    } catch (err) {
      console.error(err);
      alert("Error adding classroom. ID must be unique.");
    }
  };

  // Handle Allocation [cite: 29]
  const handleAllocate = async () => {
    setError("");
    setAllocationResult(null);
    if (!studentCount || studentCount <= 0)
      return setError("Please enter valid student count");

    try {
      const res = await axios.post(`${API_URL}/allocate`, {
        totalStudents: studentCount,
      });
      setAllocationResult(res.data.allocatedRooms);
    } catch (err) {
      // [cite: 33] Display: Not enough seats available
      setError(err.response?.data?.message || "Allocation Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Navigation */}
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2 /> Exam Seat Planner
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => setView("allocate")}
              className={`px-3 py-1 rounded ${view === "allocate" ? "bg-indigo-800" : "hover:bg-indigo-500"}`}
            >
              Allocate
            </button>
            <button
              onClick={() => setView("manage")}
              className={`px-3 py-1 rounded ${view === "manage" ? "bg-indigo-800" : "hover:bg-indigo-500"}`}
            >
              Manage Rooms
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* --- MANAGE VIEW: Add & List Classrooms --- */}
        {view === "manage" && (
          <div className="space-y-8">
            {/* Add Form [cite: 35] */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add New Classroom
              </h2>
              <form
                onSubmit={handleAddClassroom}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  type="text"
                  placeholder="Room ID (e.g. A-101)"
                  required
                  className="p-2 border rounded"
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomId: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  required
                  className="p-2 border rounded"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Floor No"
                  required
                  className="p-2 border rounded"
                  value={formData.floorNo}
                  onChange={(e) =>
                    setFormData({ ...formData, floorNo: e.target.value })
                  }
                />
                <label className="flex items-center gap-2 p-2 border rounded bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nearWashroom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nearWashroom: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Near Washroom?</span>
                </label>
                <button
                  type="submit"
                  className="md:col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-semibold"
                >
                  Add Classroom
                </button>
              </form>
            </div>

            {/* List View [cite: 36] */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <LayoutList className="w-5 h-5" /> Existing Classrooms
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-3">Room ID</th>
                      <th className="p-3">Floor</th>
                      <th className="p-3">Capacity</th>
                      <th className="p-3">Washroom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classrooms.map((room) => (
                      <tr key={room._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{room.roomId}</td>
                        <td className="p-3">{room.floorNo}</td>
                        <td className="p-3">{room.capacity}</td>
                        <td className="p-3 text-sm">
                          {room.nearWashroom ? (
                            <span className="text-green-600 bg-green-100 px-2 py-1 rounded">
                              Yes
                            </span>
                          ) : (
                            "No"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- ALLOCATE VIEW: Input & Results --- */}
        {view === "allocate" && (
          <div className="space-y-8">
            {/* Allocation Input [cite: 37] */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg mx-auto border-t-4 border-green-500">
              <h2 className="text-2xl font-bold mb-2">Allocate Exam Seats</h2>
              <p className="text-gray-500 mb-6">
                Algorithm: Min Rooms, Low Floors First
              </p>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Total Students"
                  className="flex-1 p-3 border rounded-lg text-lg"
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                />
                <button
                  onClick={handleAllocate}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700"
                >
                  Allocate
                </button>
              </div>

              {/* Error Display [cite: 33] */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-200 flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}
            </div>

            {/* Allocation Result [cite: 32, 38] */}
            {allocationResult && (
              <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900">
                  <CheckCircle className="text-green-500" /> Allocation Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allocationResult.map((room, idx) => (
                    <div
                      key={idx}
                      className="border p-4 rounded-lg bg-indigo-50 border-indigo-100 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-lg font-bold text-indigo-700">
                            {room.roomId}
                          </span>
                          <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">
                            Floor {room.floorNo}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Cap: {room.capacity}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-indigo-200">
                        <span className="block text-sm font-semibold text-gray-500 uppercase">
                          Allocated
                        </span>
                        <span className="text-2xl font-bold text-indigo-600">
                          {room.allocatedSeats} Students
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
