const gitlabTemplate = `
{% if image %}
image: {{ image }}
{% endif %}
{% if before_script and before_script.length %}
before_script:
{% for line in before_script %}
  - {{ line }}
{% endfor %}
{% endif %}
{% if after_script and after_script.length %}
after_script:
{% for line in after_script %}
  - {{ line }}
{% endfor %}
{% endif %}
{% if stages and stages.length %}
stages:
{% for stage in stages %}
  - {{ stage }}
{% endfor %}
{% endif %}
{% for job in jobs %}
{{ job.name }}:
  stage: {{ job.stage }}
  {% if job.image %}image: {{ job.image }}{% endif %}
  {% if job.before_script and job.before_script.length %}
  before_script:
  {% for line in job.before_script %}
    - {{ line }}
  {% endfor %}
  {% endif %}
  script:
  {% for line in job.script %}
    - {{ line }}
  {% endfor %}
  {% if job.after_script and job.after_script.length %}
  after_script:
  {% for line in job.after_script %}
    - {{ line }}
  {% endfor %}
  {% endif %}
{% endfor %}
`;

export default gitlabTemplate;
