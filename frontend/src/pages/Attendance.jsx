import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, Search, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Attendance() {
  const [searchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [totalPresent, setTotalPresent] = useState(0);
  
  // Custom Dropdown State
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mark Attendance Form State
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState('Present');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchAllAttendance();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllAttendance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/attendance/`);
      setAllAttendance(res.data);
    } catch (err) {
      console.error("Failed to load all attendance:", err);
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.full_name : 'Unknown Employee';
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/employees/`);
      setEmployees(res.data);
      
      // Check if URL has employee param
      const empIdParam = searchParams.get('employee');
      if (empIdParam) {
        const emp = res.data.find(e => e.id.toString() === empIdParam);
        if (emp) {
          setSelectedEmployee(emp.id);
          setSearchQuery(emp.full_name);
          fetchAttendance(emp.id);
        }
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (empId) => {
    if (!empId) {
      setAttendanceRecords([]);
      return;
    }
    try {
      setRecordsLoading(true);
      const res = await axios.get(`${API_BASE}/attendance/${empId}`);
      setAttendanceRecords(res.data);
      
      const presentCount = res.data.filter(record => record.status === 'Present').length;
      setTotalPresent(presentCount);

      setError('');
    } catch (err) {
      setError('Failed to load attendance records.');
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp.id);
    setSearchQuery(emp.full_name);
    setIsDropdownOpen(false);
    fetchAttendance(emp.id);
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/attendance/`, {
        employee_id: parseInt(selectedEmployee),
        date: markDate,
        status: markStatus
      });
      fetchAttendance(selectedEmployee); // Refresh records
      fetchAllAttendance(); // Refresh all attendance
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Attendance Log</h2>
          <p className="text-gray-500 mt-1">Monitor and register employee daily presence</p>
        </div>
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
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No employees found</h3>
            <p className="text-gray-500">Register employees first to manage their attendance records.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <Label className="mb-2 block">Target Employee</Label>
                <div className="relative" ref={dropdownRef}>
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <Input
                    type="text"
                    placeholder="Search by name or department..."
                    className="pl-10 h-11 bg-transparent border-gray-200 shadow-sm focus-visible:ring-1 focus-visible:ring-gray-950"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      if (e.target.value === '') {
                        setSelectedEmployee('');
                        setAttendanceRecords([]);
                      }
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {employees.filter(emp => 
                        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length > 0 ? (
                        employees.filter(emp => 
                          emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.department.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map(emp => (
                          <div
                            key={emp.id}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedEmployee === emp.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                            onClick={() => handleEmployeeSelect(emp)}
                          >
                            <div className="font-medium text-sm">{emp.full_name}</div>
                            <div className="text-xs text-gray-500">{emp.department}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No employees found.</div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!selectedEmployee && allAttendance.length > 0 && (
              <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center rounded-t-xl">
                  <h3 className="font-semibold text-gray-900">Recent Attendance Updates</h3>
                  <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                    <Calendar className="w-4 h-4"/>
                    {allAttendance.length} records total
                  </div>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm font-medium text-gray-500 bg-white">
                      <th className="py-3 px-6">Employee</th>
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allAttendance.slice(0, 10).map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="py-3 px-6 font-medium text-gray-900 border-r border-gray-50">{getEmployeeName(record.employee_id)}</td>
                        <td className="py-3 px-6 text-gray-600">{record.date}</td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            record.status === 'Present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status === 'Present' ? <CheckCircle className="w-3.5 h-3.5"/> : <XCircle className="w-3.5 h-3.5"/>}
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {selectedEmployee && (
              <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center rounded-t-xl">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-gray-900">Presence History</h3>
                    <div className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-green-200">
                      <CheckCircle className="w-3 h-3"/>
                      {totalPresent} Days Present
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                    <Calendar className="w-4 h-4"/>
                    {attendanceRecords.length} records
                  </div>
                </div>
                
                {recordsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500">No attendance entries recorded yet.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-sm font-medium text-gray-500">
                        <th className="py-3 px-6">Date</th>
                        <th className="py-3 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendanceRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="py-3 px-6 font-medium text-gray-900">{record.date}</td>
                          <td className="py-3 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              record.status === 'Present' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status === 'Present' ? <CheckCircle className="w-3.5 h-3.5"/> : <XCircle className="w-3.5 h-3.5"/>}
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            )}
          </div>

          {/* Right Sidebar - Mark Attendance */}
          {selectedEmployee && (
            <Card className="h-fit sticky top-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader className="bg-blue-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  Register Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleMarkAttendance} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input
                      required
                      type="date"
                      value={markDate}
                      onChange={(e) => setMarkDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status Validation</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMarkStatus('Present')}
                        className={`py-2 px-3 border rounded-lg flex justify-center items-center gap-2 transition-all duration-200 ${
                          markStatus === 'Present' 
                            ? 'border-green-600 bg-green-50 text-green-700 shadow-sm ring-1 ring-green-600' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" /> Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarkStatus('Absent')}
                        className={`py-2 px-3 border rounded-lg flex justify-center items-center gap-2 transition-all duration-200 ${
                          markStatus === 'Absent' 
                            ? 'border-red-600 bg-red-50 text-red-700 shadow-sm ring-1 ring-red-600' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                        }`}
                      >
                        <XCircle className="w-4 h-4" /> Absent
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium tracking-wide mt-2"
                  >
                    {submitting ? 'Committing...' : 'Commit Record'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </div>
  );
}
