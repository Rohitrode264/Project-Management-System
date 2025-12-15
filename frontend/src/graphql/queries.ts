import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTaskCount
      completionPercentage
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks($projectId: ID) {
    tasks(projectId: $projectId) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
      project {
        id
        name
      }
    }
  }
`;
