import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String, $dueDate: Date) {
    createProject(name: $name, description: $description, dueDate: $dueDate) {
      project {
        id
        name
        description
        status
        dueDate
        taskCount
      }
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $title: String!, $description: String, $assigneeEmail: String, $dueDate: Date) {
    createTask(projectId: $projectId, title: $title, description: $description, assigneeEmail: $assigneeEmail, dueDate: $dueDate) {
      task {
        id
        title
        status
        dueDate
      }
    }
  }
`;

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: String!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      task {
        id
        status
      }
    }
  }
`;

export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $email: String!) {
    createOrganization(name: $name, email: $email) {
      organization {
        id
        name
        slug
      }
    }
  }
`;

export const ADD_TASK_COMMENT = gql`
  mutation AddTaskComment($taskId: ID!, $content: String!, $authorEmail: String!) {
    addTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
      comment {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;
