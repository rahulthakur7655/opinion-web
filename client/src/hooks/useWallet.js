import { useState, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/wallet');
      setWallet(res.data.wallet);
    } catch (err) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      const res = await API.get('/wallet/transactions', { params: { page, limit: 20 } });
      setTransactions(res.data.transactions);
    } catch (err) {
      toast.error('Failed to load transactions');
    }
  }, []);

  const fetchRedemptions = useCallback(async () => {
    try {
      const res = await API.get('/wallet/redemptions');
      setRedemptions(res.data.redemptions);
    } catch (err) {}
  }, []);

  const redeem = useCallback(async (payload) => {
    const res = await API.post('/wallet/redeem', payload);
    toast.success(res.data.message);
    await fetchWallet();
    await fetchTransactions();
    await fetchRedemptions();
    return res.data;
  }, [fetchWallet, fetchTransactions, fetchRedemptions]);

  const fetchLeaderboard = useCallback(async (period = 'month') => {
    const res = await API.get('/wallet/leaderboard', { params: { period } });
    return res.data.leaders;
  }, []);

  return {
    wallet, transactions, redemptions, loading,
    fetchWallet, fetchTransactions, fetchRedemptions,
    redeem, fetchLeaderboard,
  };
};
