import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { Note } from "./NoteCard";

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
    isOpen,
    onClose,
    note,
}) => {
    // Get current date and time for default values
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const [reminderDate, setReminderDate] = useState(currentDate);
    const [reminderTime, setReminderTime] = useState(currentTime);
    const [duration, setDuration] = useState("60"); // Default 1 hour
    const [additionalNotes, setAdditionalNotes] = useState(note.content);
    const [location, setLocation] = useState("");

    const createICSData = (calendarData: {
        title: string;
        start: string;
        end: string;
        details: string;
        location: string;
    }) => {
        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TinyNotes//Event Invitation//EN
BEGIN:VEVENT
UID:${Date.now()}@tinynotes.com
DTSTAMP:${calendarData.start}
DTSTART:${calendarData.start}
DTEND:${calendarData.end}
SUMMARY:${calendarData.title}
DESCRIPTION:${calendarData.details}
LOCATION:${calendarData.location}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${calendarData.title}
END:VALARM
END:VEVENT
END:VCALENDAR`;
    };

    const handleAddToCalendar = () => {
        if (!reminderDate || !reminderTime) {
            toast.error("Please select both date and time for the reminder");
            return;
        }

        const startDate = new Date(`${reminderDate}T${reminderTime}`);
        const endDate = new Date(startDate.getTime() + parseInt(duration) * 60000); // duration in minutes

        const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        // Create calendar data
        const calendarData = {
            title: `Reminder: ${note.title}`,
            start: formatDate(startDate),
            end: formatDate(endDate),
            details: additionalNotes || `Note: ${note.title}`,
            location: location || "",
        };

        // Try to detect the platform and open appropriate calendar app
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
            // iOS devices - use ICS file download
            const icsData = createICSData(calendarData);
            const blob = new Blob([icsData], { type: "text/calendar" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${note.title}-reminder.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } else if (userAgent.includes("android")) {
            // Android devices - try to open calendar app
            try {
                const startTime = startDate.getTime();
                const endTime = endDate.getTime();

                // Create intent URL for Android calendar
                const intentUrl = `intent://view/calendar?beginTime=${startTime}&endTime=${endTime}&title=${encodeURIComponent(calendarData.title)}&description=${encodeURIComponent(calendarData.details)}#Intent;scheme=content;package=com.android.calendar;end`;

                window.location.href = intentUrl;

            } catch (error) {
                console.error("Error opening calendar app:", error);
                // Fallback to Google Calendar
                const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                    calendarData.title,
                )}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(
                    calendarData.details,
                )}`;

                window.open(googleCalendarUrl, "_blank");

            }
        } else {
            // Desktop - Google Calendar as fallback
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                calendarData.title,
            )}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(
                calendarData.details,
            )}`;

            window.open(googleCalendarUrl, "_blank");
        }

        onClose();
    };

    const handleClose = () => {
        setReminderDate(currentDate);
        setReminderTime(currentTime);
        setDuration("60");
        setAdditionalNotes(note.content);
        setLocation("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-white" />
                            Add to calendar
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4">

                    {/* Date input */}
                    <div className="space-y-2">
                        <Label htmlFor="reminder-date">Date</Label>
                        <Input
                            id="reminder-date"
                            type="date"
                            value={reminderDate}
                            onChange={(e) => setReminderDate(e.target.value)}
                            min={currentDate}
                            className="w-full text-white"
                        />
                    </div>

                    {/* Time input */}
                    <div className="space-y-2">
                        <Label htmlFor="reminder-time">Time</Label>
                        <Input
                            id="reminder-time"
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full text-white"
                        />
                    </div>

                    {/* Duration input */}
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            min="15"
                            max="480"
                            placeholder="60"
                            className="w-full"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Meeting room, address, or virtual link..."
                            className="w-full"
                        />
                    </div>

                    {/* Additional notes */}
                    <div className="space-y-2">
                        <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
                        <Textarea
                            id="additional-notes"
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Add any additional context for your reminder..."
                            className="min-h-[80px] resize-none"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddToCalendar}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Add Reminder
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReminderModal; 