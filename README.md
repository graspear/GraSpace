# Graspace

## Overview

Graspace is an advanced open-source photogrammetry platform designed for processing, analyzing, and visualizing geospatial data. It supports a wide range of imagery processing workflows, allowing users to generate high-quality 3D models, orthophotos, and point clouds from drone-captured images.

## Features

- Supports various input formats including aerial and satellite imagery
- Generates 3D models, orthomosaics, DEMs, and point clouds
- Web-based interface for ease of use and accessibility
- Scalable processing for small to large datasets
- API access for automated workflows
- Integration with GIS and mapping tools
- Open-source with an active community
- Advanced Ground Control Point (GCP) processing
- Support for geospatial analysis tools
- Multi-user access with role-based permissions
- Secure authentication and data encryption

## Installation

### Prerequisites

Ensure you have the following dependencies installed:

- Docker
- Python 3.x
- Node.js and npm
- PostgreSQL (if using a database backend)
- GDAL/OGR for geospatial data handling
- OpenDroneMap (if using drone imagery processing)
- Redis for background job processing

### Installation with Docker

From the Docker Quickstart Terminal or Git Bash (Windows), or from the command line (Mac / Linux / WSL), type:

```sh
git clone https://github.com/graspear/graspace.git --config core.autocrlf=input --depth 1
cd graspace
./webodm.sh build
./webodm.sh start
```

If you face any issues at the last step on Linux, make sure your user is part of the docker group:

```sh
sudo usermod -aG docker $USER
exit  # Restart shell by logging out and then back in
./webodm.sh start
```

Open a Web Browser to `http://localhost:8000`

Docker Toolbox users need to find the IP of their docker machine by running this command from the Docker Quickstart Terminal:

```sh
docker-machine ip
```

For example, if the output is `192.168.1.100`, then the address to connect to would be: `http://192.168.1.100:8000`.

To stop Graspace, press `CTRL+C` or run:

```sh
./webodm.sh stop
```

To update Graspace to the latest version, update the code and rebuild it:

```sh
git pull origin main
./webodm.sh rebuild
./webodm.sh start
```

### Manual Installation (Without Docker)

If you prefer running Graspace without Docker, follow these steps:

#### Install dependencies:

```sh
pip install -r requirements.txt
npm install
```

#### Set up the database:

```sh
createdb graspace
python manage.py migrate
```

#### Start the backend server:

```sh
python manage.py runserver
```

#### Start the frontend:

```sh
npm start
```

## Usage

- Upload images and define Ground Control Points (GCPs)
- Process data to generate 3D models and maps
- Export results in various formats such as GeoTIFF, LAS, and OBJ
- Utilize API for integrating into custom workflows
- Perform geospatial data analysis and visualization

## API Documentation

Graspace provides a REST API for automating workflows and integrating with external applications. The API allows:

- Uploading and managing datasets
- Initiating processing jobs
- Retrieving generated outputs
- Managing users and permissions
- Querying geospatial metadata

Refer to the API documentation for detailed usage:

[API Docs](http://localhost:8000/api/docs)

## Deployment

To deploy Graspace in a production environment:

```sh
docker-compose -f docker-compose.prod.yml up -d
```

Configure environment variables in `.env` for database and security settings.

### Kubernetes Deployment

For large-scale deployments, use Kubernetes:

- Install Helm and configure Kubernetes cluster
- Deploy Graspace using Helm chart:

```sh
helm install graspace ./charts/graspace
```

## Performance Optimization

- Enable caching with Redis
- Use a cloud-based PostgreSQL database for scalability
- Optimize image preprocessing with GPU acceleration
- Distribute processing tasks across multiple worker nodes

## Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub with detailed information.

## License

Graspace is licensed under the MIT License. See `LICENSE` for details.

## Contact

For issues, feature requests, or contributions, reach out via GitHub Issues or join our community discussion forum.

## Community Support

- Join our Discord server for live discussions
- Follow us on Twitter for updates
- Read our blog for development insights

## Acknowledgments

We would like to thank the open-source community and contributors who make this project possible. Special thanks to OpenDroneMap, GDAL, and PostgreSQL communities for their tools and support.

