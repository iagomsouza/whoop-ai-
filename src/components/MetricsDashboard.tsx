import React from 'react';

// Define or import shared types
interface MetricDetail {
  value?: string;
  status?: 'good' | 'neutral' | 'poor';
  trend?: 'up' | 'down' | 'flat';
}

interface KeyMetrics {
  hrv?: MetricDetail;
  recovery?: MetricDetail;
  sleep?: MetricDetail;
}

interface MetricsDashboardProps {
  metrics: KeyMetrics;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  const dashboardStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '15px 10px',
    backgroundColor: '#111111', // WHOOP Black, same as header
    borderBottom: '1px solid #404040', // WHOOP Light Gray
  };

  const metricCardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#1F1F1F', // Darker background for cards
    minWidth: '100px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize: '1.4em',
    fontWeight: 'bold',
    color: '#FFFFFF', // WHOOP White
    marginTop: '5px',
  };

  const metricLabelStyle: React.CSSProperties = {
    fontSize: '0.8em',
    color: '#A0A0A0', // Lighter Gray
    textTransform: 'uppercase',
  };

  const getStatusIndicatorStyle = (status: 'good' | 'neutral' | 'poor'): React.CSSProperties => {
    let backgroundColor = '#808080'; // Default gray
    if (status === 'good') backgroundColor = '#00FF87'; // WHOOP Green
    if (status === 'neutral') backgroundColor = '#FFD700'; // Yellow
    if (status === 'poor') backgroundColor = '#FF4136'; // Red

    return {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor,
      marginRight: '8px',
      display: 'inline-block',
    };
  };

  const metricDisplayContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginTop: '5px',
  };

  const getTrendArrow = (trend?: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    if (trend === 'flat') return '→';
    return '';
  };

  const trendArrowStyle: React.CSSProperties = {
    fontSize: '0.9em',
    marginLeft: '8px',
    color: '#C0C0C0',
  };

  const renderMetric = (label: string, metric?: MetricDetail) => {
    if (!metric || !metric.value) return null;
    return (
      <div style={metricCardStyle}>
        <span style={metricLabelStyle}>{label}</span>
        <div style={metricDisplayContainer}>
          {metric.status && <span style={getStatusIndicatorStyle(metric.status)}></span>}
          <span style={{ ...metricValueStyle, color: metric.status === 'good' ? '#00FF87' : metric.status === 'neutral' ? '#FFD700' : metric.status === 'poor' ? '#FF4136' : '#FFFFFF' }}>{metric.value}</span>
          {metric.trend && <span style={trendArrowStyle}>{getTrendArrow(metric.trend)}</span>}
        </div>
      </div>
    );
  };

  return (
    <div style={dashboardStyle}>
      {renderMetric('HRV', metrics.hrv)}
      {renderMetric('Recovery', metrics.recovery)}
      {renderMetric('Sleep', metrics.sleep)}
    </div>
  );
};

export default MetricsDashboard;
