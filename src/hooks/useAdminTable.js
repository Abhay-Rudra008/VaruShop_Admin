import { useState, useEffect, useCallback } from "react";
import adminAPI from "../api/adminAPI";

export default function useAdminTable(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (showSpinner = true) => {
    if (!endpoint) return;
    
    if (showSpinner) setLoading(true);
    
    try {
      const res = await adminAPI.get(endpoint);
 
      let extractedData = [];
      
      if (Array.isArray(res.data)) {
        extractedData = res.data;
      } else if (res.data && typeof res.data === 'object') {
        const arrayKey = Object.keys(res.data).find(key => Array.isArray(res.data[key]));
        if (arrayKey) {
           extractedData = res.data[arrayKey];
        } else if (res.data.data && Array.isArray(res.data.data)) {
           extractedData = res.data.data;
        }
      }

      setData(extractedData);
      
    } catch (err) {
      setData([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData(true);
  }, [endpoint, fetchData]);

  const executeAction = async (actionEndpoint, method = "PUT", bodyData = {}, confirmMsg = null) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return false;
    try {
      await adminAPI({ url: actionEndpoint, method, data: bodyData });
      fetchData(false); // Silent Refresh
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
      return false;
    }
  };

  return {
    data,
    loading,
    executeAction,
    refreshSilent: () => fetchData(false),
    refreshWithSpinner: () => fetchData(true)
  };
}