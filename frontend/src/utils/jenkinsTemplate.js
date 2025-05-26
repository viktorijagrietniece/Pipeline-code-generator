const jenkinsTemplate = `
pipeline {
    {% if agent is mapping %}
    agent {
        {% if agent.label is defined %}
        label '{{ agent.label }}'
        {% elif agent.docker is defined %}
        docker {
            image '{{ agent.docker.image }}'
        }
        {% elif agent.dockerfile is defined %}
        dockerfile {
            filename '{{ agent.dockerfile.filename }}'
        }
        {% else %}
        any
        {% endif %}
    }
    {% else %}
    agent {{ agent }}
    {% endif %}
    {% if environment and environment[0] and environment[0].key is defined %}
     environment {
         {% for pair in environment %}
         {{ pair.key }} = "{{ pair.value }}"
         {% endfor %}
    }
        {% endif %}
    {% if stages and stages | length > 0 %}
    stages {
        {% for stage in stages %}
        stage('{{ stage.name }}') {
            {% if stage.agent is string or stage.agent.label is defined or stage.agent.docker is defined or stage.agent.dockerfile is defined or stage.agent == 'none' or stage.agent == 'any' %}
            {% if stage.agent == 'none' or stage.agent == 'any' %}
            agent {{ stage.agent }}
            {% else %}
            agent {
            {% if stage.agent.label is defined %}
                label '{{ stage.agent.label }}'
                {% elif stage.agent.docker is defined %}
                docker {
                    image '{{ stage.agent.docker.image }}'
                }
                {% elif stage.agent.dockerfile is defined %}
                dockerfile {
                filename '{{ stage.agent.dockerfile.filename }}'
                }
                {% endif %}
            }
        {% endif %}
        {% endif %}

            {% if stage.environment and stage.environment | length > 0 %}
            environment {
                {% for pair in stage.environment %}
                {% if pair.key and pair.value %}
                {{ pair.key }} = "{{ pair.value }}"
                {% endif %}
                {% endfor %}
            }
            {% endif %}


            {% if stage.steps and stage.steps | length > 0 %}
            steps {
                {% for step in stage.steps %}
                {{ step.type }} '{{ step.value }}'
                {% endfor %}
            }
            {% endif %}

            {% if stage.post %}
            post {
                {% for condition, actions in stage.post %}
                {{ condition }} {
                    {% for action in actions %}
                    {{ action.type }} '{{ action.value }}'
                    {% endfor %}
                }
                {% endfor %}
            }
            {% endif %}
        }
        {% endfor %}
    }
    {% endif %}
    {% if post and post | length > 0 %}
    post {
        {% for condition, actions in post %}
        {{ condition }} {
            {% for action in actions %}
            {{ action.type }} '{{ action.value }}'
            {% endfor %}
        }
        {% endfor %}
    }
    {% endif %}
}

`;

export default jenkinsTemplate;
