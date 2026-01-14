import React, { useEffect, useState } from 'react';
import { eggProductionAPI } from '../utils/api';

const EggProduction = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    egg_count: '',
    feed_consumed: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [editForm, setEditForm] = useState({ egg_count: '', feed_consumed: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchEggProduction();
  }, []);

  const fetchEggProduction = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await eggProductionAPI.getAll();
      setRecords(response.data);
    } catch (err) {
      setError('Failed to fetch egg production data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.date || form.egg_count === '') {
      setFormError('Date and egg count are required');
      return;
    }
    setSubmitting(true);
    try {
      await eggProductionAPI.create({
        date: form.date,
        egg_count: Number(form.egg_count),
        feed_consumed: Number(form.feed_consumed)
      });
      setForm({
        date: new Date().toISOString().split('T')[0],
        egg_count: '',
        feed_consumed: ''
      });
      fetchEggProduction();
    } catch (err) {
      setFormError('Failed to add record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = (e) => {
    const idx = e.target.value;
    if (idx !== '') {
      setSelectedIdx(Number(idx));
      setEditing(false);
      setEditForm({
        egg_count: records[idx].egg_count,
        feed_consumed: records[idx].feed_consumed || ''
      });
    } else {
      setSelectedIdx(null);
      setEditing(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    const rec = records[selectedIdx];
    try {
      await eggProductionAPI.update({
        date: rec.date,
        timestamp: rec.timestamp,
        egg_count: editForm.egg_count,
        feed_consumed: editForm.feed_consumed
      });
      setEditing(false);
      fetchEggProduction();
    } catch (err) {
      alert('Failed to update record');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this record?')) return;
    const rec = records[selectedIdx];
    try {
      await eggProductionAPI.delete({ date: rec.date, timestamp: rec.timestamp });
      setSelectedIdx(null);
      setEditing(false);
      fetchEggProduction();
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 mb-8 px-2 sm:px-4">
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-6 text-center">🥚 Egg Production Records</h2>
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Egg Boxes</label>
            <input
              type="number"
              name="egg_count"
              value={form.egg_count}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              min="0"
              step="1"
              required
              placeholder="e.g. 10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feed Packets</label>
            <input
              type="number"
              name="feed_consumed"
              value={form.feed_consumed}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              min="0"
              step="1"
              required
              placeholder="e.g. 2"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Record'}
            </button>
          </div>
          {formError && (
            <div className="col-span-full text-red-600 text-sm mt-2">{formError}</div>
          )}
        </form>
        {/* Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Record</label>
          <select
            className="input-field"
            value={selectedIdx !== null ? selectedIdx : ''}
            onChange={handleSelect}
          >
            <option value="">-- Select a record --</option>
            {records.map((rec, idx) => (
              <option key={rec.date + rec.timestamp} value={idx}>
                {rec.date} | Egg Boxes: {rec.egg_count} | Feed Packets: {rec.feed_consumed}
              </option>
            ))}
          </select>
        </div>
        {/* Edit/Delete Buttons */}
        {selectedIdx !== null && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <div>Date: {records[selectedIdx].date}</div>
            <div>
              Egg Boxes: {" "}
              {editing ? (
                <input
                  type="number"
                  name="egg_count"
                  value={editForm.egg_count}
                  onChange={handleEditChange}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                  min="0"
                  step="1"
                />
              ) : (
                records[selectedIdx].egg_count
              )}
            </div>
            <div>
              Feed Packets: {" "}
              {editing ? (
                <input
                  type="number"
                  name="feed_consumed"
                  value={editForm.feed_consumed}
                  onChange={handleEditChange}
                  className="w-24 px-2 py-1 border border-gray-300 rounded"
                  min="0"
                  step="1"
                />
              ) : (
                records[selectedIdx].feed_consumed
              )}
            </div>
            <div className="mt-2">
              {editing ? (
                <>
                  <button
                    onClick={handleEditSave}
                    className="text-green-600 hover:underline mr-4"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-gray-500 hover:underline"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EggProduction;