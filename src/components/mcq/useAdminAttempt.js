import { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import { useAuth } from "../../auth/AuthContext";

export const useAdminAttempt = (examId) => {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const BASE_URL = isAdmin ? "/api/admin/exams" : "/api/user/exams";

  useEffect(() => {
    if (!examId) return;

    const fetchAttempt = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${BASE_URL}/attempt/${examId}`);

        setExam(res.data.exam);
        setQuestions(res.data.questions);
      } catch (err) {
        console.error(err);
        setError("Failed to load attempt");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  return { exam, questions, loading, error };
};
