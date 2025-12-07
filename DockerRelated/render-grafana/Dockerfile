# Dockerfile for Grafana on Render
FROM grafana/grafana:latest

# Set environment variables
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
ENV GF_INSTALL_PLUGINS=

# Create provisioning directories
USER root
RUN mkdir -p /etc/grafana/provisioning/datasources && \
    mkdir -p /etc/grafana/provisioning/dashboards && \
    mkdir -p /var/lib/grafana/dashboards

# Copy provisioning configurations
COPY provisioning/datasources/datasource.yml /etc/grafana/provisioning/datasources/
COPY provisioning/dashboards/dashboard.yml /etc/grafana/provisioning/dashboards/
COPY dashboards/enhanced-dashboard.json /var/lib/grafana/dashboards/

# Set correct permissions
RUN chown -R grafana:grafana /etc/grafana/provisioning && \
    chown -R grafana:grafana /var/lib/grafana/dashboards && \
    chmod -R 755 /etc/grafana/provisioning && \
    chmod -R 755 /var/lib/grafana/dashboards

USER grafana

# Expose port
EXPOSE 3000

# Run Grafana
CMD ["grafana-server", "--homepath=/usr/share/grafana", "--config=/etc/grafana/grafana.ini"]
