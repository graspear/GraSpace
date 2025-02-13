import React from 'react';
import PropTypes from 'prop-types';
import './GCPPopup.scss';

class GCPPopup extends React.Component {
  static propTypes = {
    feature: PropTypes.object.isRequired,
    task: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      error: "",
      loading: true,
      expandGCPImage: false,
      selectedShot: "",
      zoom: 4,
    };
  }

  componentDidMount() {
    const { feature } = this.props;
    document.addEventListener("fullscreenchange", this.onFullscreenChange);
    if (feature.properties.observations) {
      this.selectShot(feature.properties.observations[0].shot_id);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
  }

  selectShot = (shotId) => {
    if (shotId !== this.state.selectedShot) {
      this.setState({ loading: true, selectedShot: shotId, error: "" });
    }
  };

  getThumbUrl = (size) => {
    const { task } = this.props;
    const { selectedShot, zoom } = this.state;
    return `/api/projects/${task.project}/tasks/${task.id}/images/thumbnail/${selectedShot}?size=${size}&zoom=${zoom}`;
  };

  render() {
    const { error, loading, expandGCPImage, selectedShot } = this.state;
    const { feature, task } = this.props;
    const imageUrl = this.getThumbUrl(320);

    return (
      <div className="gcp-popup">
        <div className="title">{feature.properties.id}</div>
        <div>
          {feature.properties.observations.map((obs, idx) => (
            <span key={obs.shot_id}>
              {obs.shot_id === selectedShot ? (
                obs.shot_id
              ) : (
                <a href="#" onClick={() => this.selectShot(obs.shot_id)}>
                  {obs.shot_id}
                </a>
              )}
              {idx < feature.properties.observations.length - 1 && " | "}
            </span>
          ))}
        </div>
        <div>
          <img src={imageUrl} alt="GCP Thumbnail" />
        </div>
        <div>
          <strong>Horizontal error:</strong> {feature.properties.error[0]} meters
        </div>
        <div>
          <strong>Vertical error:</strong> {feature.properties.error[2]} meters
        </div>
      </div>
    );
  }
}

export default GCPPopup;
