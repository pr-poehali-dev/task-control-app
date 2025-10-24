"""
Business: API для управления участниками команды (получение, добавление)
Args: event с httpMethod, body; context с request_id
Returns: HTTP response с данными участников
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import random

def get_db_connection():
    """Создает подключение к базе данных"""
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def generate_color():
    """Генерирует случайный цвет в формате HEX"""
    colors = ['#2563EB', '#1E4798', '#64748B', '#0F172A', '#334155', '#475569', '#1E3A8A', '#1E40AF']
    return random.choice(colors)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
                SELECT id, name, color, created_at
                FROM team_members
                ORDER BY created_at ASC
            ''')
            members = cur.fetchall()
            
            members_list = []
            for member in members:
                members_list.append({
                    'id': str(member['id']),
                    'name': member['name'],
                    'color': member['color']
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(members_list),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            color = body.get('color', generate_color())
            
            if not name:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Name is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO team_members (name, color)
                VALUES (%s, %s)
                RETURNING id, name, color, created_at
            ''', (name, color))
            
            member = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': str(member['id']),
                    'name': member['name'],
                    'color': member['color']
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
