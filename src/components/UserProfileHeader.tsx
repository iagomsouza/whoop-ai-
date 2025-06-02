import React from 'react';

interface MetricDetail {
  value?: string;
  status?: 'good' | 'neutral' | 'poor';
}

interface KeyMetrics {
  hrv?: MetricDetail;
  recovery?: MetricDetail;
  sleep?: MetricDetail;
}

interface UserProfileHeaderProps {
  personaName: string;
  personaRole: string;
  avatarInitials?: string;
  metrics?: KeyMetrics;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  personaName,
  personaRole,
  avatarInitials,
  metrics,
}) => {
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#111111', // whoopBlack
    borderBottom: '1px solid #404040', // whoopLightGray
    color: '#FFFFFF', // whoopWhite
  };

  const avatarStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#00FF87', // whoopGreen
    color: '#111111', // whoopBlack
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2em',
    fontWeight: 'bold',
    marginRight: '15px',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '1.1em',
    fontWeight: 'bold',
    margin: 0,
  };

  const roleStyle: React.CSSProperties = {
    fontSize: '0.9em',
    color: '#A0A0A0', // Lighter gray for secondary text
    margin: 0,
  };

  const metricsContainerStyle: React.CSSProperties = {
    marginTop: '8px',
    display: 'flex',
    gap: '15px',
  };

  const metricItemStyle: React.CSSProperties = {
    fontSize: '0.8em',
    color: '#B0B0B0', // Slightly lighter gray for metric values
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const metricLabelStyle: React.CSSProperties = {
    fontSize: '0.7em',
    color: '#808080', // Darker gray for metric labels
    marginBottom: '2px',
  };

  const getStatusIndicatorStyle = (status: 'good' | 'neutral' | 'poor'): React.CSSProperties => {
    let backgroundColor = '#808080'; // Default gray for undefined status
    if (status === 'good') backgroundColor = '#00FF87'; // WHOOP Green
    if (status === 'neutral') backgroundColor = '#FFD700'; // Yellow
    if (status === 'poor') backgroundColor = '#FF4136'; // Red

    return {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor,
      marginRight: '6px',
      display: 'inline-block',
    };
  };

  const metricValueContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={headerStyle}>
      {avatarInitials && (
        <div style={avatarStyle}>
          {avatarInitials}
        </div>
      )}
      <div>
        <p style={nameStyle}>{personaName}</p>
        <p style={roleStyle}>{personaRole}</p>
        {metrics && (metrics.hrv || metrics.recovery || metrics.sleep) && (
          <div style={metricsContainerStyle}>
            {metrics.hrv && metrics.hrv.value && (
              <div style={metricItemStyle}>
                <span style={metricLabelStyle}>HRV</span>
                <div style={metricValueContainerStyle}>
                  {metrics.hrv.status && <span style={getStatusIndicatorStyle(metrics.hrv.status)}></span>}
                  <span>{metrics.hrv.value}</span>
                </div>
              </div>
            )}
            {metrics.recovery && metrics.recovery.value && (
              <div style={metricItemStyle}>
                <span style={metricLabelStyle}>RECOVERY</span>
                <div style={metricValueContainerStyle}>
                  {metrics.recovery.status && <span style={getStatusIndicatorStyle(metrics.recovery.status)}></span>}
                  <span>{metrics.recovery.value}</span>
                </div>
              </div>
            )}
            {metrics.sleep && metrics.sleep.value && (
              <div style={metricItemStyle}>
                <span style={metricLabelStyle}>SLEEP</span>
                <div style={metricValueContainerStyle}>
                  {metrics.sleep.status && <span style={getStatusIndicatorStyle(metrics.sleep.status)}></span>}
                  <span>{metrics.sleep.value}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileHeader;
