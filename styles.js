const styles = {
    animation: {
      '@-webkit-keyframes animate': {
        '0%': {
          '-webkit-transform': 'scale(0,0)',
          border: 'solid 5px white',
          opacity: 0,
        },
        '10%': {
          opacity: 0,
        },
        '30%': {
          opacity: 1,
        },
        '100%': {
          '-webkit-transform': 'scale(1,1)',
          border: 'solid 2px white',
          opacity: 0,
        },
      },
      body: {
        backgroundColor: '#0e1528',
      },
      animationContainer: {
        borderRadius: 9999,
        position: 'relative',
        width: 370,
        height: 370,
        margin: '100px auto 0 auto',
        backgroundColor: '#1c2338',
        cursor: 'pointer',
      },
      trigger: {
        position: 'absolute',
        height: 85,
        width: 82,
        background: 'white',
        marginTop: 145,
        marginLeft: 145,
      },
      wave: {
        position: 'absolute',
        width: 370,
        height: 370,
        boxSizing: 'border-box',
        border: 'solid 2px white',
        borderRadius: 9999,
        opacity: 0,
      },
      animate: {
        animation: 'animate 2s',
        animationTimingFunction: 'ease-out',
      },
      delay: {
        animationDelay: '0.2s',
      },
      delay2: {
        animationDelay: '0.8s',
      },
    },
  };
  
  export default styles;
  