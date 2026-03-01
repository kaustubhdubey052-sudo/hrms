import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Login() {
  const [email, setEmail] = useState('admin@hrms.local');
  const [password, setPassword] = useState('admin');
  const navigate = useNavigate();
  const cardRef = useRef(null);
  
  useEffect(() => {
    gsap.fromTo(cardRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login for this scope since it's an HRMS Lite assignment (admin only)
    if (email === 'admin@hrms.local' && password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      alert("Invalid credentials. Use admin@hrms.local / admin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white -z-10"></div>
      
      <div ref={cardRef} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">HRMS Portal</h1>
          <p className="text-gray-500 mt-2">Sign in to manage employees and attendance</p>
        </div>

        <Card className="shadow-2xl border-white/20 bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2 w-full"></div>
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Administrator Login</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600 font-medium">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hrms.local"
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-600 font-medium">Password</Label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-11"
                />
              </div>
              <Button type="submit" className="w-full mt-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]">
                Secure Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-gray-400 mt-8 font-medium">
          HRMS Production Environment &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
