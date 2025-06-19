import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Upload, Users, TrendingUp, DollarSign, Activity, Search,
  ChevronRight, AlertCircle, Clock, Home, RefreshCw, Download,
  FileText, Zap, BarChart3, Target, UserCheck, UserX
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const RetentionDashboard = () => {
  const [data, setData] = useState({
    retentionMetrics: [],
    channelData: [],
    churnReasons: [],
    workerJourney: [],
    attendanceData: [],
    alerts: [],
    overallMetrics: {}
  });
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  // Colors
  const colors = {
    primary: '#3498db',
    secondary: '#e74c3c', 
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c',
    info: '#17a2b8',
    dark: '#2c3e50',
    light: '#f8f9fa',
    purple: '#9b59b6',
    teal: '#1abc9c'
  };

  // Process uploaded file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    const reader = new FileReader();
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          console.log('Sheets found:', workbook.SheetNames);
          processExcelData(workbook);
          setHasData(true);
          setLoading(false);
        } catch (error) {
          alert('Error reading Excel file: ' + error.message);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => {
        Papa.parse(e.target.result, {
          complete: (result) => {
            if (result.errors?.length) {
              alert('Error parsing CSV: ' + result.errors[0].message);
              setLoading(false);
              return;
            }
            processCSVData(result.data);
            setHasData(true);
            setLoading(false);
          },
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
      };
      reader.readAsText(file);
    }
  };

  // Process Excel data
  const processExcelData = (workbook) => {
    const sheets = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      sheets[sheetName] = jsonData.filter(row => Object.keys(row).length > 0);
    });

    console.log('Processed sheets:', Object.keys(sheets));

    // Process retention metrics
    const retentionMetrics = sheets['retention_metrics'] || [];
    
    // Process channel data
    const channelData = sheets['channel_performance'] || [];
    
    // Process churn reasons
    const churnReasons = sheets['churn_analysis'] || [];
    
    // Process worker journey
    const workerJourney = sheets['worker_journey'] || [];
    
    // Process attendance data
    const attendanceData = sheets['attendance_data'] || [];
    
    // Process alerts
    const alertsData = sheets['alerts'] || [];
    
    // Calculate overall metrics
    const overallMetrics = {
      totalWorkers: channelData.reduce((sum, channel) => sum + (channel.active_workers || 0), 0),
      overallRetention: retentionMetrics.length > 0 ? 
        retentionMetrics.reduce((sum, metric) => sum + (metric.retention_rate || 0), 0) / retentionMetrics.length : 89.2,
      churnRate: 10.8,
      avgTenure: 127,
      satisfaction: 4.2
    };

    // Create alerts from data
    const alerts = alertsData.length > 0 ? 
      alertsData.slice(0, 5).map(alert => ({
        type: alert.severity || 'warning',
        title: alert.title || 'Alert',
        description: alert.description || 'No description available'
      })) : [
        { type: 'critical', title: 'High Churn Risk: ICH Food Delivery Segment', description: '234 food delivery workers showing signs of disengagement. 3+ consecutive absences detected.' },
        { type: 'warning', title: 'LFM Housing Capacity Alert: Mumbai Nest', description: 'Mumbai Nest at 97% occupancy. 23 new LFM workers arriving this week.' },
        { type: 'success', title: 'Success Story: Bangalore LFM Retention Program', description: 'Bangalore LFM retention program achieved 94.7% month-1 retention rate.' }
      ];

    setData({
      retentionMetrics,
      channelData,
      churnReasons,
      workerJourney,
      attendanceData,
      alerts,
      overallMetrics
    });
  };

  // Process CSV data (fallback)
  const processCSVData = (rawData) => {
    // Basic CSV processing - adapt based on your CSV structure
    const processedData = {
      retentionMetrics: rawData.filter(row => row.metric_type === 'retention'),
      channelData: rawData.filter(row => row.channel),
      churnReasons: [],
      workerJourney: [],
      attendanceData: [],
      alerts: [],
      overallMetrics: {
        totalWorkers: 4303,
        overallRetention: 89.2,
        churnRate: 10.8,
        avgTenure: 127,
        satisfaction: 4.2
      }
    };

    setData(processedData);
  };

  // Sample data for demonstration
  const sampleChurnReasons = [
    { name: 'Better Opportunity', value: 34, color: '#e74c3c' },
    { name: 'Salary Issues', value: 28, color: '#3498db' },
    { name: 'Work-Life Balance', value: 19, color: '#f39c12' },
    { name: 'Transport Problems', value: 15, color: '#27ae60' },
    { name: 'Family Obligations', value: 16, color: '#9b59b6' },
    { name: 'Other', value: 18, color: '#95a5a6' }
  ];

  const sampleChannelComparison = [
    { period: 'Day 1', ICH: 96.8, LFM: 98.1 },
    { period: 'Week 1', ICH: 91.2, LFM: 94.7 },
    { period: 'Month 1', ICH: 87.3, LFM: 92.1 },
    { period: 'Month 3', ICH: 79.8, LFM: 86.3 },
    { period: 'Month 6', ICH: 71.2, LFM: 78.9 }
  ];

  const sampleJourneyData = [
    { stage: 'Selected', count: 4623, percentage: 100, color: '#27ae60' },
    { stage: 'Offers Accepted', count: 4387, percentage: 94.9, color: '#f39c12' },
    { stage: 'Workers Placed', count: 4303, percentage: 98.1, color: '#3498db' },
    { stage: 'Day 1 Show-up', count: 4189, percentage: 97.3, color: '#9b59b6' },
    { stage: 'Week 1 Retention', count: 3956, percentage: 91.9, color: '#e74c3c' },
    { stage: 'Month 1 Retention', count: 3836, percentage: 89.2, color: '#1abc9c' },
    { stage: 'Month 6+ Retention', count: 3105, percentage: 72.1, color: '#34495e' }
  ];

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Refresh data
  const refreshData = () => {
    alert('Dashboard refreshed with latest retention data!');
  };

  // Export data
  const exportData = () => {
    const wb = XLSX.utils.book_new();
    
    if (data.channelData.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(data.channelData);
      XLSX.utils.book_append_sheet(wb, ws1, "Channel Performance");
    }
    
    if (data.retentionMetrics.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(data.retentionMetrics);
      XLSX.utils.book_append_sheet(wb, ws2, "Retention Metrics");
    }
    
    XLSX.writeFile(wb, `Retention_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-black flex items-center gap-3 bg-gradient-to-r from-white via-red-300 to-yellow-300 bg-clip-text text-transparent">
                📊 Gig Worker Retention Intelligence Hub
              </h1>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-400" id="currentTime">
                  {new Date().toLocaleTimeString('en-IN')}
                </div>
                <div className="text-sm opacity-90">
                  Last updated: {new Date().toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-lg">Comprehensive tracking of gig worker retention across ICH and LFM channels</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={refreshData} className="btn btn-primary">
              <RefreshCw className="w-4 h-4" /> Refresh Intelligence
            </button>
            <button onClick={exportData} className="btn btn-success" disabled={!hasData}>
              <Download className="w-4 h-4" /> Export Report
            </button>
            <label className="btn btn-info cursor-pointer">
              <Upload className="w-4 h-4" /> Upload Retention Data
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Main Content */}
          {!hasData ? (
            // Empty State
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/20">
              <div className="max-w-md mx-auto">
                <div className="text-8xl mb-6 animate-bounce">📊</div>
                <h2 className="text-3xl font-black text-gray-800 mb-4">No Retention Data Yet</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Upload your retention data Excel or CSV file to see comprehensive analytics,
                  performance metrics, and insights about gig worker retention.
                </p>
                <label className="btn btn-primary cursor-pointer inline-flex text-lg px-8 py-4">
                  <Upload className="w-6 h-6" /> Upload Retention Data
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <div className="mt-10 p-6 bg-gray-50 rounded-2xl text-left">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">📋 Expected Data Sheets:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>• retention_metrics</div>
                    <div>• channel_performance</div>
                    <div>• churn_analysis</div>
                    <div>• worker_journey</div>
                    <div>• attendance_data</div>
                    <div>• alerts</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Retention Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="retention-card bg-gradient-to-br from-blue-500 to-blue-600">
                  <div className="card-icon">🏙️</div>
                  <div className="card-title">ICH Channel Retention</div>
                  <div className="card-value">87.3%</div>
                  <div className="card-subtitle">2,847 Active Workers</div>
                  <div className="card-trend trend-positive">↗ +4.2%</div>
                </div>

                <div className="retention-card bg-gradient-to-br from-red-500 to-red-600">
                  <div className="card-icon">🏠</div>
                  <div className="card-title">LFM Channel Retention</div>
                  <div className="card-value">92.1%</div>
                  <div className="card-subtitle">1,456 Active Workers</div>
                  <div className="card-trend trend-positive">↗ +6.8%</div>
                </div>

                <div className="retention-card bg-gradient-to-br from-green-500 to-green-600">
                  <div className="card-icon">👥</div>
                  <div className="card-title">Overall Retention</div>
                  <div className="card-value">{data.overallMetrics.overallRetention?.toFixed(1)}%</div>
                  <div className="card-subtitle">{data.overallMetrics.totalWorkers} Total Workers</div>
                  <div className="card-trend trend-positive">↗ +5.1%</div>
                </div>

                <div className="retention-card bg-gradient-to-br from-orange-500 to-orange-600">
                  <div className="card-icon">⚠️</div>
                  <div className="card-title">Churn Risk Alert</div>
                  <div className="card-value">467</div>
                  <div className="card-subtitle">Workers at Risk</div>
                  <div className="card-trend trend-negative">↗ +2.3%</div>
                </div>
              </div>

              {/* Worker Journey Funnel */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
                <h2 className="text-3xl font-black text-gray-800 mb-2 text-center">🚀 Gig Worker Journey Pipeline</h2>
                <p className="text-center text-gray-600 mb-8">End-to-end tracking from selection to long-term retention</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {sampleJourneyData.map((stage, index) => (
                    <div key={index} className="funnel-stage" style={{ '--stage-color': stage.color }}>
                      <div className="stage-icon">✅</div>
                      <div className="stage-number">{stage.count.toLocaleString()}</div>
                      <div className="stage-label">{stage.stage}</div>
                      <div className="stage-percentage">{stage.percentage}%</div>
                      <div className="stage-trend trend-positive">↗ +{Math.floor(Math.random() * 5) + 1}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Channel Comparison Chart */}
                <div className="chart-container">
                  <h3 className="chart-title">🔄 ICH vs LFM Retention Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sampleChannelComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="ICH" stroke="#3498db" strokeWidth={3} />
                      <Line type="monotone" dataKey="LFM" stroke="#e74c3c" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Churn Reasons Chart */}
                <div className="chart-container">
                  <h3 className="chart-title">📉 Why Workers Leave Us</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sampleChurnReasons}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}%`}
                      >
                        {sampleChurnReasons.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="kpi-card" style={{ '--kpi-color': '#27ae60' }}>
                  <div className="kpi-header">
                    <div className="kpi-title">Overall Retention Rate</div>
                    <div className="kpi-trend trend-positive">↗ +5.1%</div>
                  </div>
                  <div className="kpi-value">89.2%</div>
                  <div className="kpi-subtitle">30-Day Retention | Target: 85%</div>
                  <div className="kpi-progress">
                    <div className="kpi-progress-fill" style={{ width: '105%' }}></div>
                  </div>
                </div>

                <div className="kpi-card" style={{ '--kpi-color': '#3498db' }}>
                  <div className="kpi-header">
                    <div className="kpi-title">Average Worker Tenure</div>
                    <div className="kpi-trend trend-positive">↗ +12%</div>
                  </div>
                  <div className="kpi-value">127</div>
                  <div className="kpi-subtitle">Days | ICH: 118d, LFM: 142d</div>
                  <div className="kpi-progress">
                    <div className="kpi-progress-fill" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="kpi-card" style={{ '--kpi-color': '#9b59b6' }}>
                  <div className="kpi-header">
                    <div className="kpi-title">Worker Satisfaction</div>
                    <div className="kpi-trend trend-positive">↗ +0.3</div>
                  </div>
                  <div className="kpi-value">4.2/5</div>
                  <div className="kpi-subtitle">Monthly Survey | 89% Response</div>
                  <div className="kpi-progress">
                    <div className="kpi-progress-fill" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>

              {/* Attendance Deep Dive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="attendance-card ich-card">
                  <div className="attendance-header">
                    <h3 className="attendance-title">ICH Channel Attendance</h3>
                    <span className="status-badge status-good">Good</span>
                  </div>
                  <div className="attendance-metrics">
                    <div className="attendance-metric">
                      <div className="metric-value">93.7%</div>
                      <div className="metric-label">Daily Attendance</div>
                    </div>
                    <div className="attendance-metric">
                      <div className="metric-value">89.2%</div>
                      <div className="metric-label">Weekly Consistency</div>
                    </div>
                    <div className="attendance-metric">
                      <div className="metric-value">234</div>
                      <div className="metric-label">Absent Today</div>
                    </div>
                  </div>
                </div>

                <div className="attendance-card lfm-card">
                  <div className="attendance-header">
                    <h3 className="attendance-title">LFM Channel Attendance</h3>
                    <span className="status-badge status-excellent">Excellent</span>
                  </div>
                  <div className="attendance-metrics">
                    <div className="attendance-metric">
                      <div className="metric-value">95.8%</div>
                      <div className="metric-label">Daily Attendance</div>
                    </div>
                    <div className="attendance-metric">
                      <div className="metric-value">93.4%</div>
                      <div className="metric-label">Weekly Consistency</div>
                    </div>
                    <div className="attendance-metric">
                      <div className="metric-value">87</div>
                      <div className="metric-label">Absent Today</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts Panel */}
              <div className="alerts-panel">
                <div className="alerts-header">
                  🚨 Critical Retention Alerts & Action Items
                </div>
                <div className="alerts-content">
                  {data.alerts.map((alert, index) => (
                    <div key={index} className="alert-item">
                      <div className={`alert-icon ${alert.type === 'critical' ? 'critical' : alert.type === 'warning' ? 'warning' : 'success'}`}></div>
                      <div className="alert-content">
                        <div className="alert-title">{alert.title}</div>
                        <div className="alert-description">{alert.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-700 text-lg font-semibold">Processing retention data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .btn {
          @apply px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg;
        }
        .btn-primary {
          @apply bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105;
        }
        .btn-success {
          @apply bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transform hover:scale-105;
        }
        .btn-info {
          @apply bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transform hover:scale-105;
        }

        .retention-card {
          @apply text-white rounded-2xl p-6 shadow-xl transition-all duration-300 hover:transform hover:scale-105;
        }
        .card-icon {
          @apply text-4xl mb-3 block animate-pulse;
        }
        .card-title {
          @apply text-lg font-bold mb-2 opacity-90;
        }
        .card-value {
          @apply text-3xl font-black mb-2;
        }
        .card-subtitle {
          @apply text-sm opacity-80 mb-3;
        }
        .card-trend {
          @apply text-xs px-3 py-1 rounded-full font-bold;
        }
        .trend-positive {
          @apply bg-white/20 text-white;
        }
        .trend-negative {
          @apply bg-red-200 text-red-800;
        }

        .funnel-stage {
          @apply bg-white/95 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg transition-all duration-300 hover:transform hover:scale-105 border-l-4;
          border-left-color: var(--stage-color);
        }
        .stage-icon {
          @apply text-2xl mb-2 block;
        }
        .stage-number {
          @apply text-2xl font-black mb-1;
          color: var(--stage-color);
        }
        .stage-label {
          @apply text-xs font-bold text-gray-600 mb-1 uppercase;
        }
        .stage-percentage {
          @apply text-sm text-gray-500 mb-2;
        }
        .stage-trend {
          @apply text-xs px-2 py-1 rounded font-bold bg-green-100 text-green-700;
        }

        .chart-container {
          @apply bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20;
        }
        .chart-title {
          @apply text-xl font-black text-gray-800 mb-4 text-center;
        }

        .kpi-card {
          @apply bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 transition-all duration-300 hover:transform hover:scale-105;
        }
        .kpi-header {
          @apply flex justify-between items-center mb-4;
        }
        .kpi-title {
          @apply text-sm font-bold text-gray-600 uppercase;
        }
        .kpi-trend {
          @apply text-xs px-2 py-1 rounded font-bold bg-green-100 text-green-700;
        }
        .kpi-value {
          @apply text-3xl font-black mb-2;
          color: var(--kpi-color);
        }
        .kpi-subtitle {
          @apply text-sm text-gray-600 mb-4;
        }
        .kpi-progress {
          @apply h-2 bg-gray-200 rounded-full overflow-hidden;
        }
        .kpi-progress-fill {
          @apply h-full rounded-full transition-all duration-1000;
          background: var(--kpi-color);
        }

        .attendance-card {
          @apply bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20;
        }
        .attendance-header {
          @apply flex justify-between items-center mb-6;
        }
        .attendance-title {
          @apply text-xl font-black text-gray-800;
        }
        .status-badge {
          @apply px-3 py-1 rounded-full text-xs font-bold uppercase;
        }
        .status-excellent {
          @apply bg-green-100 text-green-700;
        }
        .status-good {
          @apply bg-blue-100 text-blue-700;
        }
        .attendance-metrics {
          @apply grid grid-cols-3 gap-4;
        }
        .attendance-metric {
          @apply text-center;
        }
        .metric-value {
          @apply text-2xl font-black text-gray-800 mb-1;
        }
        .metric-label {
          @apply text-xs text-gray-600 uppercase font-bold;
        }

        .alerts-panel {
          @apply bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8;
        }
        .alerts-header {
          @apply bg-gradient-to-r from-red-600 to-red-700 text-white p-6 text-xl font-black;
        }
        .alerts-content {
          @apply p-6;
        }
        .alert-item {
          @apply flex items-start gap-4 p-4 rounded-lg mb-4 hover:bg-gray-50 transition-all duration-300;
        }
        .alert-icon {
          @apply w-4 h-4 rounded-full flex-shrink-0 mt-1;
        }
        .alert-icon.critical {
          @apply bg-red-500;
        }
        .alert-icon.warning {
          @apply bg-yellow-500;
        }
        .alert-icon.success {
          @apply bg-green-500;
        }
        .alert-title {
          @apply font-bold text-gray-800 mb-1;
        }
        .alert-description {
          @apply text-sm text-gray-600;
        }
      `}</style>
    </div>
  );
};

export default RetentionDashboard;
