import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Mail, Briefcase, Hash, Users, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email_address: '',
    department: 'Engineering'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/employees/`);
      setEmployees(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/employees/`, formData);
      setShowModal(false);
      setFormData({ full_name: '', email_address: '', department: 'Engineering' });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`${API_BASE}/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      setError('Failed to delete employee.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Personnel Roster</h2>
          <p className="text-gray-500 mt-1">Manage and organize your company workforce</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : employees.length === 0 ? (
        <Card className="border-dashed shadow-none bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No personnel on record</h3>
            <p className="text-gray-500 max-w-sm mb-6">You haven't added any employees to the system yet. Get started by adding a new team member.</p>
            <Button onClick={() => setShowModal(true)} variant="outline">Create Initial Record</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard/attendance?employee=${emp.id}`)}
                >
                  <td className="py-4 px-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      {emp.id}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{emp.full_name}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {emp.email_address}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {emp.department}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(emp.id);
                      }}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl">Register New Employee</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5"/>
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="E.g. Jane Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email_address}
                    onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                    placeholder="jane.doe@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>Human Resources</option>
                    <option>Marketing</option>
                    <option>Sales Operations</option>
                  </select>
                </div>
                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                    {submitting ? 'Registering...' : 'Register Employee'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
