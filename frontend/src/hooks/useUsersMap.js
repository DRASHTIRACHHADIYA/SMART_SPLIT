import { useEffect, useState } from "react";
import api from "../api/api";

function useUsersMap() {
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users"); // we will add this route if not present
        const map = {};
        res.data.forEach((u) => {
          map[u._id] = u.name;
        });
        setUsersMap(map);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, []);

  return usersMap;
}

export default useUsersMap;
