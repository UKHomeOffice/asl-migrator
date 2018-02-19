const React = require('react');

const ErrorMessage = require('./error');
const Log = require('./log');

class Upload extends React.Component {

  componentWillMount() {
    this.setState({active: false, error: null, logs: [] });
    this.events = new EventSource('/logs');
    this.events.onerror = e => {
      this.log(e.message, 'error');
    }
  }

  componentWillUnmount() {
    this.events.close();
  }

  dragover(e) {
    e.preventDefault();
    this.setState({ active: true })
  }

  dragend(e) {
    this.setState({ active: false })
  }

  drop(e) {
    e.preventDefault();
    this.setState({ active: false, error: null, logs: [] });
    const files = [].slice.call(e.dataTransfer.files);
    if (files.length === 0) {
      return;
    }
    const file = files[0];
    if (files.length > 1) {
      return this.setState({ error: 'Only upload one file at a time' });
    }
    if (file.type !== 'text/csv') {
      return this.setState({ error: `Incorrect file type: ${file.type}` });
    }
    const reader = new FileReader();
    reader.addEventListener('loadend', (e) => {
      this.upload(e.target.result);
    }, false);
    reader.readAsDataURL(file);
  }

  upload(data) {
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ data })
    };

    return fetch('/upload', options)
      .then(response => {
        return response.json()
          .then(json => {
            const id = json.id;
            this.events.addEventListener(id, data => {
              try {
                const { message, type } = JSON.parse(data.data);
                this.log(message, type);
              } catch (e) {}
            });
          });
      });

  }

  log(message, type) {
    const logs = this.state.logs;
    type = type || 'info';
    logs.push({ message, type, id: logs.length });
    this.setState(logs);
  }

  render() {
    const className = `droparea ${this.state.active ? 'active' : '' }`;
    const placeholder = 'Drag CSV files here'
    return (
      <div>
        <ErrorMessage message={this.state.error} />
        <div
          className={className}
          onDragOver={e => this.dragover(e)}
          onDragLeave={e => this.dragend(e)}
          onDragEnd={e => this.dragend(e)}
          onDrop={e => this.drop(e)}
          >
          <label>{placeholder}</label>
        </div>

        <h2>Logs</h2>
        <Log logs={this.state.logs} />
      </div>
    );
  }

}

module.exports = Upload;
