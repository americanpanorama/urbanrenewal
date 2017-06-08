import * as React from 'react';

export default class LegendGrid extends React.Component {

  render() {
    return (
        <svg>
          { [0,1,2,3,4].map(r =>{
            return (
              <g key={'lgr' + r}>
                {[0,1,2,3,4].map(c =>{
                  return (
                    <rect
                      x={c * 25}
                      y={r *25}
                      width={25}
                      height={25}
                      stroke='white'
                    />
                  );
                })};
              </g>
            );
          })}
        </svg>
    );

  }

};
