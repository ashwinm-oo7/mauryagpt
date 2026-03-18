import { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";

export const useAdminAttempt = (examId) => {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!examId) return;

    const fetchAttempt = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/admin/exams/attempt/${examId}`);

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
  }, [examId]);

  return { exam, questions, loading, error };
};
