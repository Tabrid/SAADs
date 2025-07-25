import { useEffect, useState, useRef } from "react";
import { FaPen, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { BiTrash } from "react-icons/bi";
import axios from 'axios';

const User = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentUser, setCurrentUser] = useState({ id: null, name: "", role: "", password: "", mobileNumber: "", roleId: null });
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [searchFarmer, setSearchFarmer] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const USERS_API_URL = "https://iinms.brri.gov.bd/api/users";
  const ROLES_API_URL = "https://iinms.brri.gov.bd/api/roles";
  const FARMERS_API_URL = "https://iinms.brri.gov.bd/api/farmers/farmers";

  const farmerInputRef = useRef();
  const roleInputRef = useRef();

  const fetchUsers = async () => {
    try {
      const response = await axios.get(USERS_API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(ROLES_API_URL);
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchFarmers = async (query = "") => {
    try {
      const response = await axios.get(`${FARMERS_API_URL}?search=${query}`);
      console.log(response.data);
      
      setFarmers(response.data);
    } catch (error) {
      console.error("Error fetching farmers:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchFarmers(); // Initial load (limited to 5 by backend)
  }, []);

  const openModal = (type, user = { id: null, name: "", role: "", password: "", mobileNumber: "", roleId: null }) => {
    setModalType(type);
    setCurrentUser(user);
    setIsModalOpen(true);
    setSearchFarmer(user.name || "");
    setSearchRole(user.role || "");
    setSelectedFarmer(user.name ? { name: user.name, mobileNumber: user.mobileNumber } : null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser({ id: null, name: "", role: "", password: "", mobileNumber: "", roleId: null });
    setSelectedFarmer(null);
    setSearchFarmer("");
    setSearchRole("");
  };

  const handleSave = async () => {
    const { id, name, role, password, roleId } = currentUser;
    const payload = {
      name,
      role,
      password,
      mobileNumber: selectedFarmer?.mobileNumber,
      farmerId: selectedFarmer?.id || null,
      roleId
    };

    try {
      if (modalType === "add") {
        await axios.post(USERS_API_URL, payload);
      } else if (modalType === "edit") {
        await axios.put(`${USERS_API_URL}/${id}`, payload);
      }
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${USERS_API_URL}/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...users].sort((a, b) => {
      if (key === "name" || key === "mobileNumber" || key === "role") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      return 0;
    });

    setUsers(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  useEffect(() => {
    if (searchFarmer.trim()) {
      fetchFarmers(searchFarmer.trim());
    } else {
      fetchFarmers(); // Load initial 5
    }
  }, [searchFarmer]);

  const handleClickOutside = (event) => {
    if (farmerInputRef.current && !farmerInputRef.current.contains(event.target)) {
      setShowFarmerDropdown(false);
    }
    if (roleInputRef.current && !roleInputRef.current.contains(event.target)) {
      setShowRoleDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-[166vh] mx-auto p-4 bg-[#f9fafb]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User List</h1>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2"
          />
          <button
            className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
            onClick={() => openModal("add")}
          >
            Add User
          </button>
        </div>
      </div>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2 border border-gray-300">#</th>
            <th className="text-left px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("name")}>
              <p className="flex items-center gap-5">Name {getSortIcon("name")}</p>
            </th>
            <th className="text-left px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("mobileNumber")}>
              <p className="flex items-center gap-5">Mobile Number {getSortIcon("mobileNumber")}</p>
            </th>
            <th className="text-left px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("role")}>
              <p className="flex items-center gap-5">Role {getSortIcon("role")}</p>
            </th>
            <th className="text-left px-4 py-2 border border-gray-300">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id} className="bg-gray-50">
              <td className="px-4 py-2 border border-gray-300">{index + 1}</td>
              <td className="px-4 py-2 border border-gray-300">{user.name}</td>
              <td className="px-4 py-2 border border-gray-300">{user.mobileNumber}</td>
              <td className="px-4 py-2 border border-gray-300">{user.role}</td>
              <td className="px-4 py-2 border border-gray-300">
                <button className="text-blue-500 hover:text-blue-700" onClick={() => openModal("edit", user)}>
                  <FaPen />
                </button>
                <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => handleDelete(user.id)}>
                  <BiTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start mt-10 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[500px]">
            <h2 className="text-xl font-bold mb-4">
              {modalType === "add" ? "Add User" : "Edit User"}
            </h2>

            {/* Farmer Search */}
            <div className="mb-4 relative" ref={farmerInputRef}>
              <label className="block text-sm font-medium mb-1">User Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-1"
                placeholder="Search User Name"
                value={searchFarmer}
                onFocus={() => setShowFarmerDropdown(true)}
                onChange={(e) => setSearchFarmer(e.target.value)}
              />
              {showFarmerDropdown && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded shadow-lg max-h-40 overflow-y-auto">
                  {farmers.map((farmer) => (
                    <li
                      key={farmer.id}
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer capitalize ${
                        selectedFarmer?.name === farmer.name ? "bg-gray-200" : ""
                      }`}
                      onClick={() => {
                        setSelectedFarmer(farmer);
                        setCurrentUser({ ...currentUser, name: farmer.name });
                        setSearchFarmer(farmer.name);
                        setShowFarmerDropdown(false);
                      }}
                    >
                      {farmer.name} - {farmer.mobileNumber} - {farmer.role}
                    </li>
                  ))}
                  {farmers.length === 0 && (
                    <li className="px-3 py-2 text-gray-500">No farmers found</li>
                  )}
                </ul>
              )}
            </div>

            {/* Role Search */}
            <div className="mb-4 relative" ref={roleInputRef}>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-1"
                placeholder="Search role"
                value={searchRole}
                onFocus={() => setShowRoleDropdown(true)}
                onChange={(e) => setSearchRole(e.target.value)}
              />
              {showRoleDropdown && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded shadow-lg max-h-40 overflow-y-auto">
                  {roles
                    .filter((r) => r.name.toLowerCase().includes(searchRole.toLowerCase()))
                    .map((role) => (
                      <li
                        key={role.id}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                          currentUser.role === role.name ? "bg-gray-200" : ""
                        }`}
                        onClick={() => {
                          setCurrentUser({ ...currentUser, role: role.name, roleId: role.id });
                          setSearchRole(role.name);
                          setShowRoleDropdown(false);
                        }}
                      >
                        {role.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="Enter password"
                value={currentUser.password}
                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-gray-300 rounded mr-2 hover:bg-gray-400" onClick={closeModal}>Cancel</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
