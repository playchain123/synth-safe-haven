import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Demo = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set demo config and redirect to results
    sessionStorage.setItem("aleosynth_config", JSON.stringify({
      rows: 250,
      columns: 6,
      sensitiveRemoved: 3,
      format: "csv",
      quality: "high",
    }));
    navigate("/results");
  }, [navigate]);

  return null;
};

export default Demo;
