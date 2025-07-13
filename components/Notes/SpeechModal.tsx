import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Mic,
    Play,
    Pause,
    Square,
    RotateCcw,
    FileText,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface SpeechModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveNote: (note: { title: string; content: string; tags: string }) => void;
    onOpenNotesModal: () => void;
}

interface TranscriptionState {
    text: string;
    confidence: number;
    isFinal: boolean;
}

const SpeechModal: React.FC<SpeechModalProps> = ({ isOpen, onClose, onSaveNote, onOpenNotesModal }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcription, setTranscription] = useState<TranscriptionState>({
        text: "",
        confidence: 0,
        isFinal: false,
    });
    const [fullTranscript, setFullTranscript] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isPolishing, setIsPolishing] = useState(false);
    const [polishedContent, setPolishedContent] = useState("");
    const [suggestedTitle, setSuggestedTitle] = useState("");
    const [suggestedTags, setSuggestedTags] = useState("");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [waveformData, setWaveformData] = useState<number[]>([]);
    const [contextTimer, setContextTimer] = useState(0);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [warningCount, setWarningCount] = useState(0);
    const [recognitionActive, setRecognitionActive] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const contextTimerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);

    // Get optimal language setting based on user's locale
    const getOptimalLanguage = () => {
        const userLang = navigator.language || 'en-US';
        // Map common locales to optimal speech recognition languages
        const langMap: { [key: string]: string } = {
            'en': 'en-US',
            'en-US': 'en-US',
            'en-GB': 'en-GB',
            'es': 'es-ES',
            'es-US': 'es-US',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-BR',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'ru': 'ru-RU',
            'ar': 'ar-SA',
            'hi': 'hi-IN',
        };

        const langKey = userLang.split('-')[0];
        return langMap[userLang] || langMap[langKey] || 'en-US';
    };

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toFixed(2).padStart(5, "0")}`;
    };

    // Waveform visualization
    const updateWaveform = useCallback(() => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const waveform = Array.from(dataArray.slice(0, 32)).map(
            (value) => (value / 255) * 100
        );
        setWaveformData(waveform);

        if (isRecording) {
            animationRef.current = requestAnimationFrame(updateWaveform);
        }
    }, [isRecording]);

    // Initialize Web Speech API with optimizations
    useEffect(() => {
        if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();

            // Optimized settings for better accuracy and speed
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = getOptimalLanguage();
            recognitionRef.current.maxAlternatives = 3; // Get multiple alternatives for better accuracy

            let restartTimeout: NodeJS.Timeout;

            recognitionRef.current.onstart = () => {
                setRecognitionActive(true);
                setIsTranscribing(true);
            };

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = "";
                let interimTranscript = "";
                let bestConfidence = 0;

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];

                    // Choose the best alternative based on confidence
                    let bestAlternative = result[0];
                    for (let j = 0; j < result.length; j++) {
                        if (result[j].confidence > bestAlternative.confidence) {
                            bestAlternative = result[j];
                        }
                    }

                    const transcript = bestAlternative.transcript;
                    if (result.isFinal) {
                        finalTranscript += transcript;
                        bestConfidence = Math.max(bestConfidence, bestAlternative.confidence);
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Accumulate the full transcript by appending final results
                if (finalTranscript) {
                    setFullTranscript(prev => {
                        const cleaned = finalTranscript.trim();
                        if (cleaned) {
                            return prev + cleaned + " ";
                        }
                        return prev;
                    });
                }

                setTranscription({
                    text: finalTranscript || interimTranscript,
                    confidence: bestConfidence || (event.results[0]?.[0]?.confidence || 0),
                    isFinal: !!finalTranscript,
                });

                // Clear any pending restart
                if (restartTimeout) {
                    clearTimeout(restartTimeout);
                }

                // Schedule a restart after 8 seconds of silence for better accuracy
                if (isRecording && !isPaused) {
                    restartTimeout = setTimeout(() => {
                        if (recognitionRef.current && isRecording && !isPaused) {
                            try {
                                recognitionRef.current.stop();
                                setTimeout(() => {
                                    if (recognitionRef.current && isRecording && !isPaused) {
                                        recognitionRef.current.start();
                                    }
                                }, 100);
                            } catch (error) {
                                // Silent fail for restart errors during normal operation
                                console.log("Recognition restart error:", error);
                            }
                        }
                    }, 8000);
                }
            };

            recognitionRef.current.onerror = (event) => {
                // Handle different types of speech recognition errors with appropriate toast messages
                switch (event.error) {
                    case 'aborted':
                        // Don't show toast for aborted - this is usually intentional
                        break;
                    case 'audio-capture':
                        toast.error("Microphone access failed", {
                            description: "Please check your microphone permissions and try again"
                        });
                        break;
                    case 'network':
                        toast.error("Network error", {
                            description: "Please check your internet connection and try again"
                        });
                        break;
                    case 'not-allowed':
                        toast.error("Microphone permission denied", {
                            description: "Please allow microphone access to use voice recording"
                        });
                        break;
                    case 'no-speech':
                        toast.warning("No speech detected", {
                            description: "Please speak clearly into your microphone"
                        });
                        break;
                    case 'service-not-allowed':
                        toast.error("Speech service unavailable", {
                            description: "Speech recognition service is not available"
                        });
                        break;
                    default:
                        if (event.error !== 'aborted') {
                            toast.error("Speech recognition error", {
                                description: `Error: ${event.error}`
                            });
                        }
                }

                // Auto-restart on certain errors for better reliability
                if (event.error === 'network' || event.error === 'audio-capture') {
                    setTimeout(() => {
                        if (recognitionRef.current && isRecording && !isPaused) {
                            try {
                                recognitionRef.current.start();
                            } catch (error) {
                                toast.error("Failed to restart speech recognition", {
                                    description: "Please try stopping and starting the recording again"
                                });
                                console.log("Recognition auto-restart failed:", error);
                            }
                        }
                    }, 1000);
                }
            };

            recognitionRef.current.onend = () => {
                setRecognitionActive(false);
                setIsTranscribing(false);
                // Auto-restart recognition if still recording
                if (isRecording && !isPaused) {
                    setTimeout(() => {
                        if (recognitionRef.current && isRecording && !isPaused) {
                            try {
                                recognitionRef.current.start();
                            } catch (error) {
                                // Silent fail for auto-restart - user is still recording
                                console.log("Recognition auto-restart failed:", error);
                            }
                        }
                    }, 100);
                }
            };
        }
    }, [isRecording, isPaused]);

    // Recording timer
    useEffect(() => {
        if (isRecording && !isPaused) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 0.1);
            }, 100);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording, isPaused]);

    // Context timer (5 minutes)
    useEffect(() => {
        if (fullTranscript && !isRecording) {
            contextTimerRef.current = setInterval(() => {
                setContextTimer((prev) => {
                    const newTime = prev + 1;
                    if (newTime >= 300) { // 5 minutes
                        // Inline discard logic to avoid dependency issues
                        handleNewRecording();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);

            // Warning timer (every minute)
            warningTimerRef.current = setInterval(() => {
                setWarningCount((prev) => {
                    const newCount = prev + 1;
                    if (newCount <= 5) {
                        setShowTimeoutWarning(true);
                        setTimeout(() => setShowTimeoutWarning(false), 3000);
                    }
                    return newCount;
                });
            }, 60000);
        }

        return () => {
            if (contextTimerRef.current) {
                clearInterval(contextTimerRef.current);
            }
            if (warningTimerRef.current) {
                clearInterval(warningTimerRef.current);
            }
        };
    }, [fullTranscript, isRecording]);

    const startRecording = async () => {
        try {
            // Request high-quality audio for better recognition
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 44100,
                    sampleSize: 16,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });

            // Setup audio context for waveform
            audioContextRef.current = new AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
            source.connect(analyserRef.current);

            // Setup MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/wav" });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setIsPaused(false);

            // Start speech recognition
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }

            // Start waveform animation
            updateWaveform();
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            setRecognitionActive(false);
            setIsTranscribing(false);

            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);

            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);

            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
        }
    };

    const playRecording = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const pausePlayback = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleNewRecording = () => {
        setTranscription({ text: "", confidence: 0, isFinal: false });
        setFullTranscript("");
        setPolishedContent("");
        setSuggestedTitle("");
        setSuggestedTags("");
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setContextTimer(0);
        setWarningCount(0);
        setShowTimeoutWarning(false);
        setWaveformData([]);
        setRecognitionActive(false);
        setIsTranscribing(false);
    };



    const handleDoneRecording = async () => {
        const finalTranscript = fullTranscript.trim();
        if (!finalTranscript) return;

        setIsPolishing(true);
        try {
            const response = await axios.post("/api/speech", {
                transcription: finalTranscript,
                confidence: transcription.confidence,
            });

            const data = response.data;
            setPolishedContent(data.polishedContent || finalTranscript);
            setSuggestedTitle(data.suggestedTitle || "");
            setSuggestedTags(data.suggestedTags || "");

            toast.success("Voice note processed", {
                description: "Your transcription has been polished and is ready to save"
            });
        } catch (error) {
            console.error("Error polishing transcription:", error);
            setPolishedContent(finalTranscript);
            toast.error("AI polishing failed", {
                description: "Using original transcription. Please check your connection and try again."
            });
        } finally {
            setIsPolishing(false);
        }
    };

    const handleSave = () => {
        const noteData = {
            title: suggestedTitle || "Voice Note",
            content: polishedContent || fullTranscript,
            tags: suggestedTags,
        };
        onSaveNote(noteData);
        handleNewRecording();
        onClose();
    };

    const handleWriteNotes = () => {
        onClose();
        onOpenNotesModal();
    };

    const renderWaveform = () => (
        <div className="flex h-16 items-center justify-center space-x-1">
            {Array.from({ length: 32 }, (_, i) => (
                <div
                    key={i}
                    className="bg-blue-500 w-1 transition-all duration-75"
                    style={{
                        height: `${Math.max(2, waveformData[i] || Math.random() * 20)}px`,
                        opacity: isRecording ? 1 : 0.3,
                    }}
                />
            ))}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-700">
                {/* Loading overlays */}
                {(isTranscribing || isPolishing) && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                            <p className="text-lg font-medium">
                                {isTranscribing && "Transcribing audio..."}
                                {isPolishing && "AI is polishing transcription..."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Timeout warning */}
                {showTimeoutWarning && (
                    <div className="absolute top-4 right-4 z-40 bg-yellow-500 text-black px-4 py-2 rounded-md">
                        Context expires in {5 - warningCount} minute{5 - warningCount !== 1 ? 's' : ''}
                    </div>
                )}

                <DialogHeader>
                    <DialogTitle className="text-center text-white">
                        {fullTranscript ? "Voice Note" : "Speak to Notes"}
                    </DialogTitle>
                    {isRecording && (
                        <div className="flex items-center justify-center text-sm text-blue-400">
                            <div className={`w-2 h-2 rounded-full mr-2 ${recognitionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            {recognitionActive ? "Listening..." : "Preparing..."}
                        </div>
                    )}
                    {!isRecording && fullTranscript && contextTimer > 0 && (
                        <div className="flex items-center justify-center text-sm text-yellow-400">
                            Context expires in {Math.floor((300 - contextTimer) / 60)}:{(300 - contextTimer) % 60 < 10 ? '0' : ''}{(300 - contextTimer) % 60}
                        </div>
                    )}
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-8">
                    {/* Timer Display */}
                    <div className="text-4xl font-mono text-blue-400">
                        {formatTime(recordingTime)}
                    </div>

                    {/* Waveform */}
                    {renderWaveform()}

                    {/* Main Record Button */}
                    <div className="flex items-center justify-center">
                        <Button
                            size="lg"
                            onClick={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}
                            className={`w-16 h-16 rounded-full ${isRecording
                                ? isPaused
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-blue-500 hover:bg-blue-600"
                                } transition-colors duration-200`}
                        >
                            {isRecording ? (
                                isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />
                            ) : (
                                <Mic className="w-6 h-6" />
                            )}
                        </Button>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex space-x-4">
                        {isRecording && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={stopRecording}
                                className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                Stop
                            </Button>
                        )}

                        {audioUrl && !isRecording && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={isPlaying ? pausePlayback : playRecording}
                                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                            >
                                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                {isPlaying ? "Pause" : "Play"}
                            </Button>
                        )}

                        {fullTranscript && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNewRecording}
                                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                New
                            </Button>
                        )}
                    </div>

                    {/* Recording Status */}
                    {fullTranscript && (
                        <div className="w-full max-w-md">
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <p className="text-sm text-gray-300 mb-2">
                                    Recording captured - Click Done to process
                                </p>
                                <p className="text-white text-sm opacity-75">
                                    {fullTranscript.length > 100
                                        ? fullTranscript.substring(0, 100) + "..."
                                        : fullTranscript}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Polished Content */}
                    {polishedContent && (
                        <div className="w-full max-w-md">
                            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                                <p className="text-sm text-blue-300 mb-2">Polished Content</p>
                                <p className="text-white whitespace-pre-wrap">{polishedContent}</p>
                                {suggestedTitle && (
                                    <div className="mt-3 pt-3 border-t border-blue-700">
                                        <p className="text-xs text-blue-300">Suggested Title:</p>
                                        <p className="text-sm text-white">{suggestedTitle}</p>
                                    </div>
                                )}
                                {suggestedTags && (
                                    <div className="mt-2">
                                        <p className="text-xs text-blue-300">Suggested Tags:</p>
                                        <p className="text-sm text-white">{suggestedTags}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* No Transcription Detected */}
                {!fullTranscript && !isRecording && audioBlob && (
                    <div className="text-center py-4">
                        <p className="text-gray-400 mb-4">No transcription detected</p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={handleNewRecording}
                                variant="outline"
                                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            <Button
                                onClick={handleWriteNotes}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Write Notes Instead
                            </Button>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex justify-between">
                    <div className="flex space-x-2">
                        {fullTranscript && !polishedContent && !isRecording && (
                            <Button
                                onClick={handleDoneRecording}
                                disabled={isPolishing}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Done
                            </Button>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        {polishedContent && (
                            <Button
                                onClick={handleSave}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                Save Note
                            </Button>
                        )}
                    </div>
                </DialogFooter>

                {/* Hidden audio element for playback */}
                {audioUrl && (
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        style={{ display: "none" }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SpeechModal; 