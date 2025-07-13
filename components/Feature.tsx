import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Feature = () => {
  const features = [
    {
      title: "Text Summarization with AI",
      description: "Automatically summarize your notes using advanced AI technology. Get concise summaries of lengthy notes to quickly understand key points.",
      icon: "📝",
      badge: "AI Powered",
      color: "bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "Speech with AI",
      description: "Convert your voice to text seamlessly and have natural conversations with AI about your notes. Perfect for hands-free note-taking.",
      icon: "🎙️",
      badge: "Voice Tech",
      color: "bg-green-500/10 border-green-500/20"
    },
    {
      title: "Google Calendar Integration",
      description: "Sync your notes with Google Calendar events. Create reminders, schedule follow-ups, and organize your thoughts around your calendar.",
      icon: "📅",
      badge: "Integration",
      color: "bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Powerful Features
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover what makes TinyNotes the perfect companion for your note-taking journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className={`p-6 ${feature.color} backdrop-blur-sm border hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{feature.icon}</div>
              <Badge variant="secondary" className="text-xs">
                {feature.badge}
              </Badge>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3">
              {feature.title}
            </h3>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-400 text-sm">
          More features coming soon...
        </p>
      </div>
    </section>
  );
};

export default Feature; 