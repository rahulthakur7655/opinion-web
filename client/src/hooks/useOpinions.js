import { useState, useCallback, useRef } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export const useOpinions = () => {
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const filterRef = useRef({});

  const fetchOpinions = useCallback(async (filters = {}, reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params = { page: currentPage, limit: 8, ...filters };
      filterRef.current = filters;

      const res = await API.get('/opinions', { params });
      const data = res.data;

      if (reset) {
        setOpinions(data.opinions);
        setPage(2);
      } else {
        setOpinions((prev) => [...prev, ...data.opinions]);
        setPage((p) => p + 1);
      }

      setTotal(data.total);
      setHasMore(data.page < data.pages);
    } catch (err) {
      toast.error('Failed to load opinions');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchOpinions(filterRef.current, false);
  }, [loading, hasMore, fetchOpinions]);

  const vote = useCallback(async (opinionId, optionIndex) => {
    try {
      const res = await API.post(`/opinions/${opinionId}/vote`, { optionIndex });
      const { opinion, coinsEarned, streakBonus, wallet } = res.data;

      // Update the local opinion state
      setOpinions((prev) =>
        prev.map((op) =>
          op._id === opinionId
            ? { ...opinion, hasVoted: true, userVote: optionIndex }
            : op
        )
      );

      return { coinsEarned, streakBonus, wallet };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit vote';
      throw new Error(msg);
    }
  }, []);

  const createOpinion = useCallback(async (data) => {
    const res = await API.post('/opinions', data);
    return res.data.opinion;
  }, []);

  return { opinions, loading, hasMore, total, fetchOpinions, loadMore, vote, createOpinion };
};
