import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment
from django.db.models import Count, Q

class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = ("id", "name", "slug", "contact_email", "created_at")

class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_task_count = graphene.Int()
    completion_percentage = graphene.Float()

    class Meta:
        model = Project
        fields = ("id", "organization", "name", "description", "status", "due_date", "created_at", "tasks")

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completed_task_count(self, info):
        return self.tasks.filter(status='DONE').count()

    def resolve_completion_percentage(self, info):
        total = self.tasks.count()
        if total == 0:
            return 0
        completed = self.tasks.filter(status='DONE').count()
        return (completed / total) * 100

class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = ("id", "project", "title", "description", "status", "assignee_email", "due_date", "created_at", "comments")

class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ("id", "task", "content", "author_email", "created_at")

class Query(graphene.ObjectType):
    projects = graphene.List(ProjectType)
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))
    tasks = graphene.List(TaskType, project_id=graphene.ID(required=False))

    def resolve_projects(self, info):
        user_org = info.context.organization
        if not user_org:
            return Project.objects.none()
        return Project.objects.filter(organization=user_org)

    def resolve_project(self, info, id):
        user_org = info.context.organization
        if not user_org:
            return None
        try:
            return Project.objects.get(id=id, organization=user_org)
        except Project.DoesNotExist:
            return None

    def resolve_tasks(self, info, project_id=None):
        user_org = info.context.organization
        if not user_org:
            return Task.objects.none()
        
        tasks = Task.objects.filter(project__organization=user_org)
        
        if project_id:
            tasks = tasks.filter(project_id=project_id)
            
        return tasks

class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, name, description="", status="ACTIVE", due_date=None):
        user_org = info.context.organization
        if not user_org:
            raise Exception("Organization context required")
        
        project = Project.objects.create(
            organization=user_org,
            name=name,
            description=description,
            status=status,
            due_date=due_date
        )
        return CreateProject(project=project)

class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.Date() # Simplification for now, should be DateTime maybe? Model has DateTime.

    task = graphene.Field(TaskType)

    def mutate(self, info, project_id, title, description="", status="TODO", assignee_email="", due_date=None):
        user_org = info.context.organization
        if not user_org:
            raise Exception("Organization context required")
        
        try:
            project = Project.objects.get(id=project_id, organization=user_org)
        except Project.DoesNotExist:
            raise Exception("Project not found or access denied")

        task = Task.objects.create(
            project=project,
            title=title,
            description=description,
            status=status,
            assignee_email=assignee_email,
            due_date=due_date
        )
        return CreateTask(task=task)

class UpdateTaskStatus(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        status = graphene.String(required=True)

    task = graphene.Field(TaskType)

    def mutate(self, info, task_id, status):
        user_org = info.context.organization
        if not user_org:
            raise Exception("Organization context required")

        try:
            task = Task.objects.get(id=task_id, project__organization=user_org)
        except Task.DoesNotExist:
            raise Exception("Task not found or access denied")
        
        task.status = status
        task.save()
        return UpdateTaskStatus(task=task)

class AddTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, task_id, content, author_email):
        user_org = info.context.organization
        if not user_org:
            raise Exception("Organization context required")

        try:
            task = Task.objects.get(id=task_id, project__organization=user_org)
        except Task.DoesNotExist:
            raise Exception("Task not found or access denied")

        comment = TaskComment.objects.create(
            task=task,
            content=content,
            author_email=author_email
        )
        return AddTaskComment(comment=comment)

class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        email = graphene.String(required=True)

    organization = graphene.Field(OrganizationType)

    def mutate(self, info, name, email):
        from django.utils.text import slugify
        base_slug = slugify(name)
        slug = base_slug
        counter = 1
        while Organization.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
            
        org = Organization.objects.create(
            name=name,
            contact_email=email,
            slug=slug
        )
        return CreateOrganization(organization=org)

        
class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    create_task = CreateTask.Field()
    update_task_status = UpdateTaskStatus.Field()
    add_task_comment = AddTaskComment.Field()
    create_organization = CreateOrganization.Field()
