const React = require('react');

class Logs extends React.Component {

  render() {
    const logs = this.props.logs || [];
    return (
      <ul className="logs">
        {
          logs.map((line, i) => {
            return <li key={line.id || i} className={line.type}>{line.message}</li>
          })
        }
      </ul>
    );
  }

}

module.exports = Logs;
