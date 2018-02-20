const React = require('react');

class Progress extends React.Component {

  render() {
    const percent = Math.round(100 * this.props.done / this.props.total);
    return (
      <div>
        <h2>{this.props.name} - {percent}%</h2>
        <div className="progress-bar">
          {
            percent < 100 && <div className="progress-incomplete" style={ { width: `${percent}%` } }/>
          }
          {
            percent === 100 && <div className="progress-complete" />
          }
        </div>
      </div>
    );
  }

}

module.exports = Progress;
