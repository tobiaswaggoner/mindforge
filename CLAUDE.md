# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MindForge: The Codex** is an AI-powered learning tracker designed to help students systematically capture and archive educational content. The project addresses knowledge fragmentation in school environments by enabling daily interactions with an AI tutor to build a comprehensive, personal knowledge database.

### Core Concept
- Students use multimodal input (text, voice, photos) for 5-10 minute daily sessions
- AI tutor guides students through their school subjects 
- Content is automatically processed and archived for future retrieval
- Natural language queries enable easy access to past learning content

## Architecture & Technology Stack

### Current State
This is an early-stage project with minimal implementation:
- Documentation exists only in `docs/brainstorming/` with German specifications

### Planned Architecture (from specifications)
- **Frontend**: React-based responsive web app (Mobile-First)
- **Backend**: Node.js with Express framework
- **Database**: MongoDB with Event Sourcing pattern (without dedicated event store)
- **Authentication**: OAuth (Google as initial provider)
- **AI Integration**: Multimodal LLM (OpenAI Vision) for content processing
- **Containerization**: Docker Compose setup

## Key Features (MVP Scope)

1. **AI-guided daily check-ins** - Conversational interface for content capture
2. **Multimodal input** - Text, audio recordings, photo uploads with OCR
3. **Intelligent archiving** - Auto-categorization by subject and date
4. **Semantic search** - Natural language queries over captured content
5. **Content summarization** - LLM-generated daily subject summaries

## Development Commands

Currently no build system is configured. Based on the planned tech stack, expect:
- `npm install` - Install dependencies
- `npm run dev` - Development server
- `npm run build` - Production build
- `docker-compose up` - Container deployment

## Development Notes

### Data Processing Pipeline
- Raw inputs (text/voice/images) → Multimodal LLM processing → Daily subject summaries → RAG-enabled retrieval
- Event sourcing approach stores all interactions chronologically
- Generated summaries serve as the primary knowledge base for queries

### Happy Path (V1)
1. Google OAuth authentication
2. AI tutor asks about today's subjects
3. Student uploads photo of notebook entry
4. LLM extracts and processes content
5. Background process generates daily subject summary
6. Future queries retrieve information via RAG system

### Out of Scope (V1)
- Edit/delete functionality
- Group collaboration features  
- Teacher accounts
- Advanced semantic search
- Learning modules (quizzes, flashcards)

## Language & Localization
- Primary language: German
- Target users: German-speaking students
- All code comments and types are in English