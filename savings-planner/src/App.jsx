import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';


import GoalForm from './components/GoalForm';
import GoalCard from './components/GoalCard';
import AddContributionModal from './components/AddContributionModal';
import DashboardSummary from './components/DashboardSummary';
import { fetchExchangeRate } from './services/exchangeRate';
const [isLoading, setIsLoading] = useState(false);

const App = () => {
  const [goals, setGoals] = useState([]);
  const [modalGoalId, setModalGoalId] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(80);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
     const savedGoals = Cookies.get('syfe_goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    loadRate();
  }, []);

  // Save to cookie when goals change
  useEffect(() => {
    Cookies.set('syfe_goals', JSON.stringify(goals), { expires: 7 });
  }, [goals]);
  const loadRate = async () => {
    setIsLoading(true);
    try {
      const data = await fetchExchangeRate();
      setExchangeRate(prev => {
        if (prev === data.rate) return data.rate + 0.0001;
        return data.rate;
      });

      setLastUpdated(new Date(data.time).toLocaleString()); // format for UI

      console.log("Exchange Rate:", data.rate);
      console.log("Last Updated:", data.time);
    } catch (err) {
      alert("Failed to fetch exchange rate.");
    }
    finally {
      setIsLoading(false); // end loading
    }
  };

  const addGoal = (goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const addContribution = (goalId, contribution) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? { ...goal, contributions: [...goal.contributions, contribution] }
          : goal
      )
    );
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8ff] to-[#e0edff]">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">𖣠 Syfe Savings Planner</h1>

        {/* Dashboard Summary */}
         <div className="overflow-hidden w-full bg-white py-2 rounded-md shadow-inner">
          <p className="scroll-horizontal text-sm text-gray-700 px-4">
            Exchange Rate (USD to INR): {exchangeRate.toFixed(2)} | Last updated: {lastUpdated || 'N/A'}
          </p>
        </div>

        {/* ✅ Pass props here */}
        <DashboardSummary
          goals={goals}
          exchangeRate={exchangeRate}
          lastUpdated={lastUpdated}
          onRefresh={loadRate}
          isLoading={isLoading}
        />

        {/* Goal Creation */}
        <GoalForm addGoal={addGoal} />

        {/* Goal Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">Add commentMore actions
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              exchangeRate={exchangeRate}
              addContribution={setModalGoalId}
              onDelete={deleteGoal}
            />
          ))}
        </div>

        {/* Add Contribution Modal */}
        {modalGoalId && (
          <AddContributionModal
            goalId={modalGoalId}
            onSave={addContribution}
            onClose={() => setModalGoalId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default App;