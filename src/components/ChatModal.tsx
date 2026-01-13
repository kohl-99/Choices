'use client';

import { useState, useRef, useEffect } from 'react';
import { Person, ScenarioType } from '@/lib/types';
import { X, Send, User, Bot, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { generateSystemPrompt } from '@/lib/chatUtils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatModalProps {
    person: Person;
    isOpen: boolean;
    onClose: () => void;
}

export function ChatModal({ person, isOpen, onClose }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'init-1',
                    role: 'assistant',
                    content: `Hi, I'm ${person.name}. I'm a ${person.demographics.age}-year-old ${person.demographics.occupation || 'person'} from ${person.demographics.hometownType}. What would you like to know?`
                }
            ]);
        }
    }, [isOpen, person, messages.length]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const systemPrompt = generateSystemPrompt(person);

            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    systemPrompt
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Include details if available
                throw new Error(data.details || data.error || 'Failed to chat');
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant', // 'model' from API, standardized to 'assistant' for UI
                content: data.content
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error: unknown) {
            console.error('Chat error:', error);
            // Show error in chat
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `(System Error) Unable to connect to persona: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-slate-200">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{person.name}</h3>
                            <p className="text-xs text-slate-500">{person.politics} • {person.demographics.age}yo</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={clsx(
                                "flex items-start gap-3 max-w-[85%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm",
                                msg.role === 'user' ? "bg-indigo-600" : "bg-slate-700" // Bot color
                            )}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={clsx(
                                "p-3 rounded-2xl text-sm shadow-sm",
                                msg.role === 'user'
                                    ? "bg-indigo-600 text-white rounded-br-none"
                                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm ml-12">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Ask ${person.name} something...`}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
