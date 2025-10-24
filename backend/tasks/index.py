"""
Business: API для управления задачами (получение, создание, обновление, удаление)
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с данными задач
"""

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    """Создает подключение к базе данных"""
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute('''
                SELECT 
                    t.id,
                    t.title,
                    t.deadline,
                    t.completed,
                    t.assignee_id,
                    tm.name as assignee,
                    t.created_at,
                    t.updated_at
                FROM tasks t
                LEFT JOIN team_members tm ON t.assignee_id = tm.id
                ORDER BY t.created_at DESC
            ''')
            tasks = cur.fetchall()
            
            tasks_list = []
            for task in tasks:
                tasks_list.append({
                    'id': str(task['id']),
                    'title': task['title'],
                    'deadline': task['deadline'].isoformat() if task['deadline'] else None,
                    'completed': task['completed'],
                    'assignee': task['assignee'],
                    'assigneeId': str(task['assignee_id']) if task['assignee_id'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(tasks_list),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            title = body.get('title')
            deadline = body.get('deadline')
            assignee_id = body.get('assigneeId')
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Title is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO tasks (title, deadline, assignee_id, completed)
                VALUES (%s, %s, %s, false)
                RETURNING id, title, deadline, completed, assignee_id, created_at, updated_at
            ''', (title, deadline, assignee_id))
            
            task = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': str(task['id']),
                    'title': task['title'],
                    'deadline': task['deadline'].isoformat() if task['deadline'] else None,
                    'completed': task['completed'],
                    'assigneeId': str(task['assignee_id']) if task['assignee_id'] else None
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')
            completed = body.get('completed')
            
            if not task_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Task ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE tasks 
                SET completed = %s
                WHERE id = %s
                RETURNING id, title, deadline, completed, assignee_id
            ''', (completed, task_id))
            
            task = cur.fetchone()
            conn.commit()
            
            if not task:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Task not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': str(task['id']),
                    'title': task['title'],
                    'deadline': task['deadline'].isoformat() if task['deadline'] else None,
                    'completed': task['completed'],
                    'assigneeId': str(task['assignee_id']) if task['assignee_id'] else None
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
