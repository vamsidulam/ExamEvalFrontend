import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ClipboardCheck,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';
import aboutImg from '../components/assets/Aboutus.png';
import logo from '../components/assets/logo.png';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroSection = document.getElementById('hero-section');
      
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        setIsScrolled(scrollPosition > heroHeight * 0.3);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
	{
		icon: Sparkles,
		title: "AI-Based Evaluation",
		description: "Evaluates both objective and descriptive answers using AI models.",
		color: "bg-blue-500"
	},
	{
		icon: ClipboardCheck,
		title: "Automated Grading System",
		description: "Automatically grades papers, reducing teacher workload.",
		color: "bg-green-500"
	},
	{
		icon: BookOpen,
		title: "Question Paper Generation",
		description: "Creates balanced question papers instantly from syllabus.",
		color: "bg-indigo-500"
	},
	{
		icon: BarChart3,
		title: "Student Performance Analytics",
		description: "Tracks and visualizes student progress with insights.",
		color: "bg-purple-500"
	},
	{
		icon: Star,
		title: "Smart Report Generation",
		description: "Produces downloadable performance reports automatically.",
		color: "bg-pink-500"
	},
	{
		icon: Mail,
		title: "Real-Time Feedback",
		description: "Gives instant feedback after exam submission.",
		color: "bg-red-500"
	},
	{
		icon: Phone,
		title: "Multi-Format Uploads",
		description: "Supports PDF, Word, and image answer sheet uploads.",
		color: "bg-yellow-500"
	},
	{
		icon: MapPin,
		title: "Secure Data Storage",
		description: "Stores all exam data safely with encryption.",
		color: "bg-teal-500"
	},
	{
		icon: Users,
		title: "Adaptive Quiz Platform",
		description: "Adjusts quiz difficulty based on student performance.",
		color: "bg-orange-500"
	},
	{
		icon: Linkedin,
		title: "Seamless Teacher Dashboard",
		description: "Centralized control panel for managing evaluations.",
		color: "bg-gray-500"
	}
  ];

  const steps = [
    {
      step: '01',
      title: 'Get Started',
      description: 'Access the dashboard and start using AI-powered tools',
      icon: BookOpen
    },
    {
      step: '02',
      title: 'Generate Question Paper',
      description: 'Use AI to create customized question papers for any subject',
      icon: Sparkles
    },
    {
      step: '03',
      title: 'Upload Student & Key Papers',
      description: 'Upload answer sheets and answer keys for evaluation',
      icon: ClipboardCheck
    },
    {
      step: '04',
      title: 'Get Results & Insights',
      description: 'Receive detailed results and performance analytics',
      icon: BarChart3
    }
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header/Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg' 
          : 'bg-transparent'
      }`} id="navbar">
        <div className="w-full pl-0 pr-2 sm:pr-3 lg:pr-4">
          <div className="flex items-center h-16">
            {/* Left-aligned Logo */}
            <div className="flex items-center space-x-2">
              <BookOpen className={`h-8 w-8 transition-colors duration-300 ${
                isScrolled ? 'text-blue-600' : 'text-blue-400'
              }`} />
              <h1 className={`text-xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>EduAI</h1>
            </div>
            
            {/* Center-aligned Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
              <a href="#features" className={`transition-colors duration-200 font-medium ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/80 hover:text-blue-400'
              }`}>
                Features
              </a>
              <a href="#how-it-works" className={`transition-colors duration-200 font-medium ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/80 hover:text-blue-400'
              }`}>
                How it Works
              </a>
              <a href="#about" className={`transition-colors duration-200 font-medium ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/80 hover:text-blue-400'
              }`}>
                About
              </a>
              <a href="#contact" className={`transition-colors duration-200 font-medium ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/80 hover:text-blue-400'
              }`}>
                Contact
              </a>
            </nav>
            
            {/* Right-aligned CTAs */}
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-blue-500/25"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Two Column Layout */}
      <section id="hero-section" className="relative min-h-screen overflow-hidden">
        {/* Beautiful Styled Background - Multi-layer Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          {/* Animated mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 animate-pulse"></div>
          
          {/* Floating gradient orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-400/40 to-blue-500/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/40 to-pink-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-400/40 to-indigo-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          
          {/* Diagonal stripes pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.05) 10px,
              rgba(255,255,255,0.05) 20px
            )`
          }}></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite'
          }}></div>
        </div>
        
        <div className="relative z-10 w-full px-2 sm:px-3 lg:px-4 pt-20">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
            
            {/* Left Column - Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Revolutionize Education
                  <span className="block text-blue-400 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    with AI
                  </span>
            </h1>
                
                {/* Supporting Text */}
                <div className="space-y-3">
                  <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              Generate question papers, evaluate answer sheets, and get insights—instantly. 
                  </p>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Save time and improve accuracy with our AI-powered education platform.
            </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center space-x-2 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                style={{
                  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </Link>
                
              <button
                onClick={scrollToFeatures}
                className="group relative border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold bg-transparent hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <span className="relative z-10">Learn More</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-xl border-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-3">
                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-300" />
                    <span className="text-sm font-medium text-white">AI-Powered</span>
          </div>
                </div>
                
                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 hover:bg-green-500/20 hover:border-green-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">
                  <div className="flex items-center space-x-2">
                    <ClipboardCheck className="h-4 w-4 text-green-300" />
                    <span className="text-sm font-medium text-white">Instant Evaluation</span>
                  </div>
                </div>
                
                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-purple-300" />
                    <span className="text-sm font-medium text-white">Performance Analytics</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section - Two Column Layout */}
      <section id="features" className="py-20  mt-[-80px] relative overflow-hidden">
        {/* Updated Background with New Gradient Design */}
        {/* Decorative Dotted Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-5 left-0 w-40 h-80 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px),
                radial-gradient(circle, #1e40af 1.5px, transparent 1.5px)
              `,
              backgroundSize: "18px 18px, 18px 18px",
              backgroundPosition: "0 0, 9px 9px",
              backgroundBlendMode: "normal",
            }}
          ></div>
          <div
            className="absolute bottom-20 right-0 w-40 h-80 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px),
                radial-gradient(circle, #1e40af 1.5px, transparent 1.5px)
              `,
              backgroundSize: "18px 18px, 18px 18px",
              backgroundPosition: "100% 100%, calc(100% - 9px) calc(100% - 9px)",
              backgroundBlendMode: "normal",
            }}
          ></div>
        </div>
        
        {/* Abstract Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-cyan-200/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-indigo-200/30 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column - Header moved to top side and CTAs */}
            <div className="space-y-10">
              {/* Moved Header Block with additional top adjustment */}
              <div className="mt-[-50px] mb-8">
                <h2 className="font-bold text-gray-900 leading-tight">
                  <div className="text-4xl md:text-5xl">
                    Empowers Educators 
                  </div>
                  <div className="text-3xl mt-5 text-blue-900 md:text-4xl relative h-12">
                    <div className="typingText animate-type1">
                      with Smart Automations..
                    </div>
                    <div className="typingText animate-type2">
                      with AI Innovations....
                    </div>
                    <div className="typingText animate-type3">
                      with Intelligent Insights......
                    </div>
                  </div>
                </h2>
                <p className="text-xl text-brown-600 leading-relaxed mt-10">
                  Everything you need to streamline your educational workflow and enhance student learning outcomes.
                </p>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                  <span>Try Demo</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                <button 
                  onClick={scrollToFeatures}
                  className="group relative border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold bg-transparent hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <span>Learn More</span>
                </button>
              </div>
            </div>
            
            {/* Right Column - Auto-scrolling Feature Cards in 2-Column Grid */}
            <div className="relative h-[600px] mr-3 overflow-hidden ">
              <div className="absolute inset-0 flex gap-4">
                {/* First Column - Scrolls Up: Display features 1-5 */}
                <div className="flex-1 flex flex-col space-y-4 mr-6 animate-scroll-up hover:pause-scroll">
                  {/* First set for Column 1 */}
                  {features.slice(0, 5).map((feature, index) => (
                    <div key={`col1-first-${index}`} className="group relative bg-white p-6 rounded-2xl border-2 border-blue-900 hover:border-blue-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-103 cursor-pointer overflow-hidden h-40 flex-shrink-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      {/* Replace icon container */}
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center space-x-2">
                        <feature.icon className="h-8 w-8 text-blue-500 transition-transform duration-300" />
                        <span className="text-sm font-bold text-gray-900">{feature.title}</span>
                      </div>
                        
                      {/* Text Content without duplicate title */}
                      <div className="relative z-10 flex flex-col space-y-3 h-full">
                        <div className="flex-1 min-w-0">
                          <p className="animate-textSlide text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500 line-clamp-3">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Duplicate set for Column 1 */}
                  {features.slice(0, 5).map((feature, index) => (
                    <div key={`col1-second-${index}`} className="group relative bg-white p-6 rounded-2xl border-2 border-blue-900 hover:border-blue-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-103 cursor-pointer overflow-hidden h-40 flex-shrink-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center space-x-2">
                        <feature.icon className="h-8 w-8 text-blue-500 transition-transform duration-300" />
                        <span className="text-sm font-bold text-gray-900">{feature.title}</span>
                      </div>
                      
                      {/* Text Content without duplicate title */}
                      <div className="relative z-10 flex flex-col space-y-3 h-full">
                {/* Updated Icon Container (decreased width) */}
                        <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center space-x-2">
                          <feature.icon className="h-8 w-8 text-blue-500 transition-transform duration-300" />
                          <span className="text-sm font-bold text-gray-900">{feature.title}</span>
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500 line-clamp-3">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Hover Glow Effect */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.color.replace('bg-', 'bg-')} bg-opacity-10 blur-xl`}></div>
                    </div>
                  ))}
                </div>
                
                {/* Second Column - Scrolls Down: Display features 6-10 */}
                <div className="flex-1 flex flex-col space-y-4 animate-scroll-down hover:pause-scroll">
                  {/* First set for Column 2 */}
                  {features.slice(5, 10).map((feature, index) => (
                    <div key={`col2-first-${index}`} className="group relative bg-white p-6 rounded-2xl border-2 border-blue-900 hover:border-blue-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-103 cursor-pointer overflow-hidden h-40 flex-shrink-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center space-x-2">
                        <feature.icon className="h-8 w-8 text-blue-500 transition-transform duration-300" />
                        <span className="text-sm font-bold text-gray-900">{feature.title}</span>
                      </div>
                        
                      {/* Text Content without duplicate title */}
                      <div className="relative z-10 flex flex-col space-y-3 h-full">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500 line-clamp-3">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Duplicate set for Column 2 */}
                  {features.slice(5, 10).map((feature, index) => (
                    <div key={`col2-second-${index}`} className="group relative bg-white p-6 rounded-2xl border-2 border-blue-900 hover:border-blue-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-103 cursor-pointer overflow-hidden h-40 flex-shrink-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center space-x-2">
                        <feature.icon className="h-8 w-8 text-blue-500 transition-transform duration-300" />
                        <span className="text-sm font-bold text-gray-900">{feature.title}</span>
                      </div>
                        
                        {/* Text Content without duplicate title */}
                        <div className="relative z-10 flex flex-col space-y-3 h-full">
                {/* Updated Icon Container (decreased width) */}
                        <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center space-x-2">
                          <feature.icon className="h-8 w-8 text-blue-500 transition-transform duration-300" />
                          <span className="text-sm font-bold text-gray-900">{feature.title}</span>
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500 line-clamp-3">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Hover Glow Effect */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.color.replace('bg-', 'bg-')} bg-opacity-10 blur-xl`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - compact zig-zag timeline (left side) */}
      <section id="how-it-works" className="py-20 relative overflow-hidden">
        {/* Decorative Dotted Background (features style) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-5 left-0 w-40 h-80 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px),
                radial-gradient(circle, #1e40af 1.5px, transparent 1.5px)
              `,
              backgroundSize: "18px 18px, 18px 18px",
              backgroundPosition: "0 0, 9px 9px",
            }}
          ></div>
          <div
            className="absolute bottom-20 right-0 w-40 h-80 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px),
                radial-gradient(circle, #1e40af 1.5px, transparent 1.5px)
              `,
              backgroundSize: "18px 18px, 18px 18px",
              backgroundPosition: "100% 100%, calc(100% - 9px) calc(100% - 9px)",
            }}
          ></div>
        </div>
        
        {/* Abstract Geometric Shapes (features style) */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-cyan-200/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-indigo-200/30 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started in just four simple steps and transform your educational workflow.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* LEFT: compact zig-zag timeline */}
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-sm"></div>

              <div className="relative space-y-10 max-w-3xl mx-auto">
                {steps.map((step, index) => {
                  const isLeft = index % 2 === 1; // odd -> left card, even -> right card
                  return (
                    <div key={step.step} className="relative flex items-center" style={{ minHeight: 80 }}>
                      <div className={`w-1/2 flex ${isLeft ? 'justify-end pr-6' : 'pr-6 invisible'}`}>
                        {isLeft && (
                          <div className="w-64 bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <step.icon className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600">{step.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                          <span className="text-sm font-bold text-white">{step.step}</span>
                        </div>
                        <div className={`absolute top-1/2 transform -translate-y-1/2 ${isLeft ? 'right-[6.5rem]' : 'left-[6.5rem]'} w-6 h-0.5 bg-gradient-to-r from-blue-400 to-transparent`} />
                      </div>

                      <div className={`w-1/2 flex ${!isLeft ? 'justify-start pl-6' : 'pl-6 invisible'}`}>
                        {!isLeft && (
                          <div className="w-64 bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <step.icon className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600">{step.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: explanatory content */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20 mt-14">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Seamless Evaluation Process</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  At exameval.ai, the process is seamless and intelligent. Teachers upload scanned or digital answer sheets, which our AI instantly reads and organizes. Using advanced OCR and NLP models, the system understands both questions and student responses, evaluating them against key solutions through semantic similarity. The results are delivered instantly with detailed analytics and feedback — empowering educators to assess smarter and students to learn better.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-blue-600"/></div>
                    <span className="text-gray-700 text-sm">Instant AI-powered grading</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center"><BarChart3 className="w-4 h-4 text-green-600"/></div>
                    <span className="text-gray-700 text-sm">Detailed performance analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center"><Star className="w-4 h-4 text-purple-600"/></div>
                    <span className="text-gray-700 text-sm">Secure data storage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About/Purpose Section (features-style background) */}
      <section id="about" className="py-20 relative overflow-hidden">
        {/* Decorative Dotted Background (features style) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-5 left-0 w-40 h-80 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px),
                radial-gradient(circle, #1e40af 1.5px, transparent 1.5px)
              `,
              backgroundSize: "18px 18px, 18px 18px",
              backgroundPosition: "0 0, 9px 9px",
            }}
          ></div>
          <div
            className="absolute bottom-20 right-0 w-40 h-80 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px),
                radial-gradient(circle, #1e40af 1.5px, transparent 1.5px)
              `,
              backgroundSize: "18px 18px, 18px 18px",
              backgroundPosition: "100% 100%, calc(100% - 9px) calc(100% - 9px)",
            }}
          ></div>
        </div>
        
        {/* Abstract Geometric Shapes (features style) */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-cyan-200/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-indigo-200/30 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Column - Mission Content */}
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Mission
              </h2>
              
              <div className="space-y-6">
                <p className="text-xl text-gray-700 leading-relaxed">
                  We believe that technology should empower educators, not complicate their lives. Our AI-powered platform is designed to help teachers save valuable time while improving the quality and consistency of student assessments.
                </p>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  By automating the tedious aspects of question paper creation and evaluation, we enable educators to focus on what matters most—inspiring and guiding their students.
                </p>
              </div>
              
              {/* Key Points with Icons */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Reduce grading time by 90%</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">AI-powered accurate evaluation</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Enhanced student learning outcomes</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="mt-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            
            {/* Right Column - Illustration/Animation */}
            <div className="flex items-stretch animate-fade-in-delay">
              <img
                src={aboutImg}
                alt="About Us"
                className="w-full h-full object-cover"
                style={{ maxHeight: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src={logo} 
                  alt="ExamEval.ai Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Revolutionizing education with AI-powered tools for question generation, 
                evaluation, and analytics. Empowering educators worldwide.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors duration-200" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors duration-200" />
                <Linkedin className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors duration-200" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors duration-200" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-200">How it Works</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors duration-200">About</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">support@exameval.ai</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">
                © 2025 ExamEval.ai Platform. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDelay {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scrollUp {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scrollDown {
          from {
            transform: translateY(-50%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes textSlide {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Caption text container with typewriter effect */
        .typingText {
          position: absolute;
          overflow: hidden;
          white-space: nowrap;
          text-align: left;
          border-right: 0.15em solid #000;
        }

        /* First caption: "with Smart Automations" (assumed 22ch) */
        @keyframes typewriterCycle1 {
          0% { width: 0ch; opacity: 1; }
          30% { width: 22ch; opacity: 1; }
          35% { width: 22ch; opacity: 0; }
          100% { width: 22ch; opacity: 0; }
        }
        /* Second caption: "with AI Innovation" (assumed 18ch) */
        @keyframes typewriterCycle2 {
          0%, 33% { width: 0ch; opacity: 0; }
          63% { width: 18ch; opacity: 1; }
          68% { width: 18ch; opacity: 0; }
          100% { width: 18ch; opacity: 0; }
        }
        /* Third caption: "with Intelligent Insights" (assumed 25ch) */
        @keyframes typewriterCycle3 {
          0%, 66% { width: 0ch; opacity: 0; }
          96% { width: 25ch; opacity: 1; }
          100% { width: 25ch; opacity: 0; }
        }

        .animate-type1 {
          animation: typewriterCycle1 9s steps(22, end) infinite;
        }
        .animate-type2 {
          animation: typewriterCycle2 9s steps(18, end) infinite;
        }
        .animate-type3 {
          animation: typewriterCycle3 9s steps(25, end) infinite;
        }
        
        /* Existing animations... */
        .animate-fade-in {
          opacity: 0;
          transform: translateY(0px) rotate(0deg);
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-fade-in-delay {
          opacity: 0;
          transform: translateY(0px) rotate(0deg);
          animation: fadeInDelay 0.8s ease-out 0.3s both;
        }
        .animate-scroll-up {
          animation: scrollUp 20s linear infinite;
        }
        
        .animate-scroll-down {
          animation: scrollDown 20s linear infinite;
        }
        
        .hover\\:pause-scroll:hover {
          animation-play-state: paused;
        }
        
        .animate-float-slow {
          animation: floatSlow 8s ease-in-out infinite;
        }}
        
        .animate-float-slow-delay {
          animation: floatSlow 8s ease-in-out infinite 2s;
        }
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
          }        
          75% {
            transform: translateY(-15px) rotate(2deg);
          }        
        }
        
        /* New glassy moving gradient effect */
        @keyframes glassyFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-glassy {
          animation: glassyFlow 10s ease infinite;
          background: linear-gradient(270deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1), rgba(255,255,255,0.1));
          background-size: 400% 400%;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .grid.grid-cols-1.lg\\:grid-cols-2 {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .min-h-\\[80vh\\] {
            min-height: auto;
          }
        }
        
        /* Text clamping for responsiveness */
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
        }
        
        /* Hover effects */
        .hover\\:scale-103:hover {
          transform: scale(1.03);
        }
        
        @keyframes orbit1 {
          0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          0% { transform: rotate(90deg) translateX(60px) rotate(-90deg); }
          100% { transform: rotate(450deg) translateX(60px) rotate(-450deg); }
        }
        @keyframes orbit3 {
          0% { transform: rotate(180deg) translateX(60px) rotate(-180deg); }
          100% { transform: rotate(540deg) translateX(60px) rotate(-540deg); }
        }
        @keyframes orbit4 {
          0% { transform: rotate(270deg) translateX(60px) rotate(-270deg); }
          100% { transform: rotate(630deg) translateX(60px) rotate(-630deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-orbit-1 { animation: orbit1 8s linear infinite; }
        .animate-orbit-2 { animation: orbit2 8s linear infinite; }
        .animate-orbit-3 { animation: orbit3 8s linear infinite; }
        .animate-orbit-4 { animation: orbit4 8s linear infinite; }
      `}</style>
    </div>
  );
};

export default HomePage;
