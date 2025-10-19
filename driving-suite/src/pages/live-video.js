import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Eye, Pause, Play, RotateCcw, Download } from 'lucide-react';

export default function ProfilePage() {
    const [isRecording, setIsRecording] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [actions, setActions] = useState([]);
    const [cameraReady, setCameraReady] = useState(false);
    const [error, setError] = useState(null);
    const [mediapipeLoaded, setMediapipeLoaded] = useState(false);

    const videoRef = useRef(null);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const faceLandmarkerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const startTimeRef = useRef(null);
    const lastDetectionRef = useRef({
        eyeLeft: false,
        eyeRight: false,
        headLeft: false,
        headRight: false,
        timestamp: 0
    });

    const videos = [
        {
            type: 'right-turn',
            videoFile: 'https://storage.googleapis.com/driving-videos/turn-left.mp4',
            potentialHazards: [
                'Vehicle in front'
            ],
        }
    ]

    // Load MediaPipe Face Landmarker
    useEffect(() => {
        const loadMediaPipe = async () => {
            try {
                // Import MediaPipe from npm package
                const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

                const filesetResolver = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
                );

                const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU'
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                    outputFaceBlendshapes: true,
                    outputFacialTransformationMatrixes: true
                });

                faceLandmarkerRef.current = faceLandmarker;
                setMediapipeLoaded(true);
                console.log('MediaPipe Face Landmarker loaded successfully');
            } catch (err) {
                console.error('Error initializing MediaPipe:', err);
                setError('Failed to load face tracking. Please refresh the page.');
            }
        };

        loadMediaPipe();
    }, []);

    // Initialize webcam
    const initCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1280,
                    height: 720,
                    facingMode: 'user'
                }
            });

            if (webcamRef.current) {
                webcamRef.current.srcObject = stream;
                webcamRef.current.onloadedmetadata = () => {
                    setCameraReady(true);
                    console.log('Camera ready');
                };
            }
        } catch (err) {
            setError('Camera access denied. Please allow camera access to use this feature.');
            console.error('Camera error:', err);
        }
    };

    // Detect head and eye movements using MediaPipe
    const detectMovements = (timestamp) => {
        if (!faceLandmarkerRef.current || !webcamRef.current || !isRecording || isPaused) {
            return;
        }


        try {

            const video = webcamRef.current;
            if (!video.videoWidth || !video.videoHeight ||
                video.readyState < video.HAVE_CURRENT_DATA) {
                console.log('Video not ready');
                return;
            }

            const nowInMs = Date.now();
            const results = faceLandmarkerRef.current.detectForVideo(webcamRef.current, nowInMs);

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const landmarks = results.faceLandmarks[0];

                // Key facial landmarks (MediaPipe 478 landmarks)
                const noseTip = landmarks[1];        // Nose tip
                const leftEyeInner = landmarks[133];  // Left eye inner corner
                const leftEyeOuter = landmarks[33];   // Left eye outer corner
                const rightEyeInner = landmarks[362]; // Right eye inner corner
                const rightEyeOuter = landmarks[263]; // Right eye outer corner
                const leftCheek = landmarks[234];     // Left cheek
                const rightCheek = landmarks[454];    // Right cheek

                // Calculate relative timestamp
                const relativeTime = (timestamp - startTimeRef.current) / 1000;

                // Calculate head yaw (left/right rotation)
                const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
                const noseCenterOffset = noseTip.x - (leftCheek.x + rightCheek.x) / 2;
                const headYaw = noseCenterOffset / faceWidth;

                // Calculate eye gaze direction
                const leftEyeCenter = (leftEyeInner.x + leftEyeOuter.x) / 2;
                const rightEyeCenter = (rightEyeInner.x + rightEyeOuter.x) / 2;
                const eyesCenterX = (leftEyeCenter + rightEyeCenter) / 2;
                const eyeGaze = eyesCenterX - noseTip.x;

                // Thresholds for detection
                const HEAD_THRESHOLD = 0.15;
                const EYE_THRESHOLD = 0.03;
                const DEBOUNCE_TIME = 0.3; // seconds

                const currentState = {
                    eyeLeft: eyeGaze < -EYE_THRESHOLD,
                    eyeRight: eyeGaze > EYE_THRESHOLD,
                    headLeft: headYaw < -HEAD_THRESHOLD,
                    headRight: headYaw > HEAD_THRESHOLD
                };

                if (relativeTime - lastDetectionRef.current.timestamp > DEBOUNCE_TIME) {
                    if (currentState.eyeLeft && !lastDetectionRef.current.eyeLeft) {
                        recordAction('EYE_LEFT', relativeTime);
                        lastDetectionRef.current.eyeLeft = true;
                        lastDetectionRef.current.timestamp = relativeTime;
                    } else if (!currentState.eyeLeft && lastDetectionRef.current.eyeLeft) {
                        lastDetectionRef.current.eyeLeft = false;
                    }

                    // Check EYE_RIGHT (checking right mirror)
                    if (currentState.eyeRight && !lastDetectionRef.current.eyeRight) {
                        recordAction('EYE_RIGHT', relativeTime);
                        lastDetectionRef.current.eyeRight = true;
                        lastDetectionRef.current.timestamp = relativeTime;
                    } else if (!currentState.eyeRight && lastDetectionRef.current.eyeRight) {
                        lastDetectionRef.current.eyeRight = false;
                    }

                    // Check HEAD_LEFT (checking left blind spot)
                    if (currentState.headLeft && !lastDetectionRef.current.headLeft) {
                        recordAction('HEAD_LEFT', relativeTime);
                        lastDetectionRef.current.headLeft = true;
                        lastDetectionRef.current.timestamp = relativeTime;
                    } else if (!currentState.headLeft && lastDetectionRef.current.headLeft) {
                        lastDetectionRef.current.headLeft = false;
                    }

                    // Check HEAD_RIGHT (checking right blind spot)
                    if (currentState.headRight && !lastDetectionRef.current.headRight) {
                        recordAction('HEAD_RIGHT', relativeTime);
                        lastDetectionRef.current.headRight = true;
                        lastDetectionRef.current.timestamp = relativeTime;
                    } else if (!currentState.headRight && lastDetectionRef.current.headRight) {
                        lastDetectionRef.current.headRight = false;
                    }
                }

                // Draw webcam feed with landmarks overlay
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    canvasRef.current.width = webcamRef.current.videoWidth;
                    canvasRef.current.height = webcamRef.current.videoHeight;

                    ctx.drawImage(webcamRef.current, 0, 0);

                    // Draw detection indicators
                    ctx.font = '16px monospace';
                    ctx.fillStyle = currentState.eyeLeft ? '#22c55e' : '#ef4444';
                    ctx.fillText('EYE_LEFT', 10, 30);

                    ctx.fillStyle = currentState.eyeRight ? '#22c55e' : '#ef4444';
                    ctx.fillText('EYE_RIGHT', 10, 60);

                    ctx.fillStyle = currentState.headLeft ? '#22c55e' : '#ef4444';
                    ctx.fillText('HEAD_LEFT', 10, 90);

                    ctx.fillStyle = currentState.headRight ? '#22c55e' : '#ef4444';
                    ctx.fillText('HEAD_RIGHT', 10, 120);
                }
            }
        } catch (err) {
            console.error('Detection error:', err);
        }
    };

    // Record user action with timestamp
    const recordAction = (actionType, relativeTime) => {
        const action = {
            type: actionType,
            timestamp: parseFloat(relativeTime.toFixed(3)),
            videoTime: parseFloat(videoRef.current?.currentTime.toFixed(3) || 0)
        };

        setActions(prev => [...prev, action]);
        console.log('Action recorded:', action);
    };

    // Animation loop for detection
    const processFrame = (timestamp) => {
        detectMovements(timestamp);
        animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Start simulation
    const startSimulation = async (video) => {
        setCurrentVideo(video);
        setActions([]);
        setIsRecording(true);
        setIsPaused(false);
        startTimeRef.current = performance.now();
        lastDetectionRef.current = {
            eyeLeft: false,
            eyeRight: false,
            headLeft: false,
            headRight: false,
            timestamp: 0
        };

        if (!cameraReady) {
            await initCamera();
        }

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
            }
            animationFrameRef.current = requestAnimationFrame(processFrame);
        }, 100);
    };

    // Pause/Resume
    const togglePause = () => {
        setIsPaused(!isPaused);
        if (videoRef.current) {
            if (isPaused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    // Stop simulation
    const stopSimulation = () => {
        setIsRecording(false);
        console.log('is paused')
        setIsPaused(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    // Reset simulation
    const resetSimulation = () => {
        stopSimulation();
        setActions([]);
        setCurrentVideo(null);
        lastDetectionRef.current = {
            eyeLeft: false,
            eyeRight: false,
            headLeft: false,
            headRight: false,
            timestamp: 0
        };
    };

    // Export data for LLM analysis
    const exportData = () => {
        const data = {
            videoId: currentVideo.id,
            videoType: currentVideo.type,
            description: currentVideo.description,
            potentialHazards: currentVideo.potentialHazards,
            userActions: actions,
            totalDuration: videoRef.current?.duration || 0,
            totalActions: actions.length,
            actionBreakdown: {
                EYE_LEFT: actions.filter(a => a.type === 'EYE_LEFT').length,
                EYE_RIGHT: actions.filter(a => a.type === 'EYE_RIGHT').length,
                HEAD_LEFT: actions.filter(a => a.type === 'HEAD_LEFT').length,
                HEAD_RIGHT: actions.filter(a => a.type === 'HEAD_RIGHT').length
            },
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `driving-sim-${currentVideo.id}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (webcamRef.current?.srcObject) {
                webcamRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Driving Hazard Perception Simulator
                    </h1>
                    <p className="text-slate-400">Practice your observation skills for Irish driving conditions</p>
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {!currentVideo ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {videos.map(video => (
                            <div key={video.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
                                <div className="aspect-video bg-slate-700 rounded mb-4 flex items-center justify-center">
                                    <Video className="w-16 h-16 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{video.description}</h3>
                                <div className="mb-4">
                                    <p className="text-sm text-slate-400 mb-2">Potential Hazards:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {video.potentialHazards.map((hazard, idx) => (
                                            <span key={idx} className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded">
                        {hazard}
                      </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => startSimulation(video)}
                                    disabled={!mediapipeLoaded}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
                                >
                                    {mediapipeLoaded ? 'Start Simulation' : 'Loading MediaPipe...'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Main video */}
                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Video className="w-5 h-5" />
                                    Dashboard Camera
                                </h3>
                                <video
                                    ref={videoRef}
                                    src={currentVideo.videoFile}
                                    className="w-full rounded bg-black"
                                    onEnded={stopSimulation}
                                />
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={togglePause}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded flex items-center justify-center gap-2 transition"
                                    >
                                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                        {isPaused ? 'Resume' : 'Pause'}
                                    </button>
                                    <button
                                        onClick={resetSimulation}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded flex items-center justify-center gap-2 transition"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Webcam feed */}
                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Camera className="w-5 h-5" />
                                    Your Camera (Face Tracking)
                                </h3>
                                <div className="relative">
                                    <video
                                        ref={webcamRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="hidden"
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        className="w-full rounded bg-slate-900"
                                    />
                                    {cameraReady && isRecording && (
                                        <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            Recording
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>



                        {/* Expected hazards */}
                        <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-4">
                            <h4 className="text-amber-300 font-semibold mb-2">Expected Observations:</h4>
                            <ul className="text-amber-200 text-sm space-y-1">
                                {currentVideo.potentialHazards.map((hazard, idx) => (
                                    <li key={idx}>• {hazard}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-3">How it works:</h3>
                    <ul className="text-slate-400 text-sm space-y-2">
                        <li>• <strong className="text-white">EYE_LEFT/RIGHT:</strong> Move your eyes to check side mirrors</li>
                        <li>• <strong className="text-white">HEAD_LEFT/RIGHT:</strong> Turn your head to check blind spots</li>
                        <li>• Actions are recorded with precise timestamps relative to the video</li>
                        <li>• Export the data after completion for AI-powered analysis of your driving awareness</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}