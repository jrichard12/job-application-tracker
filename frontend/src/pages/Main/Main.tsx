import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, IconButton } from '@mui/material';
import { GitHub, LinkedIn, PlayArrow, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { siReact, siTypescript, siSass, siMui, siNodedotjs } from "simple-icons";

import { loginUser, useAuth } from "../../services/authService";
import { getDemoUserJobs } from "../../services/demoUserService";
import type { UserInfo } from "../../types/UserInfo";
import chromeDemoVideo from "../../assets/chrome-demo.mp4";
import emailDemoVideo from "../../assets/email-demo.mp4";
import trackerDemoVideo from "../../assets/tracker-demo.mp4";
import LambdaIcon from "../../assets/Lambda.svg";
import CognitoIcon from "../../assets/Cognito.svg";
import DynamoDBIcon from "../../assets/DynamoDB.svg";
import SESIcon from "../../assets/SimpleEmailService.svg";
import S3Icon from "../../assets/SimpleStorageService.svg";
import "./Main.scss";
import SnackbarAlert from '../../components/SnackbarAlert/SnackbarAlert';

interface MainProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

function Main({ updateUser }: MainProps) {
    const { user, setUser, setDemoMode } = useAuth();
    const navigate = useNavigate();

    // Refs for scroll animations
    const demoSectionRef = useRef<HTMLElement>(null);
    const techSectionRef = useRef<HTMLElement>(null);
    const ctaSectionRef = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Video loading state
    const [videoLoading, setVideoLoading] = useState(true);

    // Carousel state
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set([0])); // Start with first video loaded

    // Demo features data
    const demoFeatures = useMemo(() => [
        {
            id: 1,
            title: "Track Applications",
            description: "Easily keep track of important details and statuses of all your job applications.",
            type: "video",
            videoSrc: trackerDemoVideo
        },
        {
            id: 2,
            title: "Chrome Extension",
            description: "Add jobs directly from job boards with just a couple of clicks using the Chrome extension.",
            type: "video",
            videoSrc: chromeDemoVideo
        },
        {
            id: 3,
            title: "Email Notifications",
            description: "Sign up for email reminders to follow up on your applications and never miss important deadlines.",
            type: "video",
            videoSrc: emailDemoVideo
        }
    ], []);

    // Carousel navigation functions
    const nextSlide = () => {
        const nextIndex = (currentSlide + 1) % demoFeatures.length;
        setCurrentSlide(nextIndex);
        // Load the next video if it hasn't been loaded yet
        setLoadedVideos(prev => new Set(prev).add(nextIndex));
    };

    const prevSlide = () => {
        const prevIndex = (currentSlide - 1 + demoFeatures.length) % demoFeatures.length;
        setCurrentSlide(prevIndex);
        // Load the previous video if it hasn't been loaded yet
        setLoadedVideos(prev => new Set(prev).add(prevIndex));
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        // Load the selected video if it hasn't been loaded yet
        setLoadedVideos(prev => new Set(prev).add(index));
    };

    // Handle video playback when slide changes
    useEffect(() => {
        if (videoRef.current && demoFeatures[currentSlide].type === 'video' && loadedVideos.has(currentSlide)) {
            videoRef.current.play().catch(console.error);
        }
    }, [currentSlide, demoFeatures, loadedVideos]);

    // Note: Removed automatic redirect to dashboard so users can visit home page via logo
    // Logged-in users can now access the home page when clicking the AppTracker logo

    // Scroll animation observer
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        [demoSectionRef, techSectionRef, ctaSectionRef].forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, []);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setSnackbar({ open: true, message, severity });
    }

    const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
    }

    const handleDemoLogin = async () => {
        try {
            setDemoMode(true);
            
            // Navigate immediately to show loading state
            navigate('/dashboard');
            
            const result = await loginUser("", "", () => { }, true);
            console.log("Login successful:", result);
            const authToken = result.authToken;
            const id = result.userId;
            setUser({ username: 'demo@example.com', authToken, id });
            const loadedJobApps = getDemoUserJobs();
            updateUser({
                id: id,
                email: 'demo@example.com',
                jobApps: loadedJobApps
            } as UserInfo);
            console.log("Demo user login activated");
        } catch (error) {
            console.error('Demo login failed:', error);
            showSnackbar('Demo login failed. Please try again.', 'error');
        }
    };

    const techStack = [
        { name: "React", iconPath: siReact.path, color: `#${siReact.hex}` },
        { name: "TypeScript", iconPath: siTypescript.path, color: `#${siTypescript.hex}` },
        { name: "Sass", iconPath: siSass.path, color: `#${siSass.hex}` },
        { name: "Material UI", iconPath: siMui.path, color: `#${siMui.hex}` },
        { name: "Node.js", iconPath: siNodedotjs.path, color: `#${siNodedotjs.hex}` },
        { name: "AWS Lambda", icon: LambdaIcon },
        { name: "AWS Cognito", icon: CognitoIcon },
        { name: "AWS DynamoDB", icon: DynamoDBIcon },
        { name: "AWS SES", icon: SESIcon },
        { name: "AWS S3", icon: S3Icon },    
    ];

    return (
        <>
            <div className="landing-page">
                {/* Hero Section */}
                <section className="hero-section">
                    <Container maxWidth="lg">
                        <Box className="hero-content">
                            <Typography variant="h1" className="hero-title">
                                Streamline Your Job Search
                            </Typography>
                            <Typography variant="h5" className="hero-subtitle">
                                Organize applications, track progress, and keep all your job notes in one place
                            </Typography>
                            {user ? (
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="cta-button"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Go to Dashboard
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="cta-button"
                                    onClick={handleDemoLogin}
                                >
                                    Try the Demo
                                </Button>
                            )}
                        </Box>
                    </Container>
                </section>

                {/* Demo Video Showcase */}
                <section className="demo-section scroll-animate" ref={demoSectionRef}>
                    <Container maxWidth="lg">
                        <Typography variant="h3" className="section-title">
                            Feature Highlights
                        </Typography>

                        {/* Carousel Container */}
                        <div className="carousel-container">
                            <div className="carousel-content">
                                {/* Main Display Area */}
                                <div className="carousel-main">
                                    {demoFeatures[currentSlide].type === 'video' ? (
                                        <div className={`carousel-video-container ${videoLoading ? 'loading' : ''}`}>
                                            {loadedVideos.has(currentSlide) ? (
                                                <video
                                                    ref={videoRef}
                                                    className="carousel-video"
                                                    src={demoFeatures[currentSlide].videoSrc}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    onError={(e) => {
                                                        console.error('Video failed to load:', e);
                                                        setVideoLoading(false);
                                                    }}
                                                    onLoadStart={() => {
                                                        setVideoLoading(true);
                                                    }}
                                                    onCanPlay={() => {
                                                        setVideoLoading(false);
                                                    }}
                                                    onLoadedMetadata={() => {
                                                        console.log('Video metadata loaded');
                                                    }}
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <div className="carousel-placeholder">
                                                    <PlayArrow className="carousel-play-icon" />
                                                    <Typography variant="body1">Click to load video</Typography>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="carousel-placeholder">
                                            <PlayArrow className="carousel-play-icon" />
                                            <Typography variant="body1">Demo Coming Soon</Typography>
                                        </div>
                                    )}
                                </div>

                                {/* Content Description */}
                                <div className="carousel-description">
                                    <Typography variant="h4" className="carousel-title">
                                        {demoFeatures[currentSlide].title}
                                    </Typography>
                                    <Typography variant="body1" className="carousel-text">
                                        {demoFeatures[currentSlide].description}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {/* External Navigation Controls */}
                        <div className="carousel-external-controls">
                            <IconButton
                                className="carousel-external-nav-button carousel-prev"
                                onClick={prevSlide}
                                aria-label="Previous slide"
                            >
                                <ChevronLeft />
                            </IconButton>

                            {/* Dots Indicator */}
                            <div className="carousel-external-dots">
                                {demoFeatures.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`carousel-external-dot ${index === currentSlide ? 'active' : ''}`}
                                        onClick={() => goToSlide(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <IconButton
                                className="carousel-external-nav-button carousel-next"
                                onClick={nextSlide}
                                aria-label="Next slide"
                            >
                                <ChevronRight />
                            </IconButton>
                        </div>
                    </Container>
                </section>

                {/* Tech Stack Section */}
                <section className="tech-section scroll-animate" ref={techSectionRef}>
                    <Container maxWidth="lg">
                        <Typography variant="h3" className="section-title">
                            Tools & Technologies
                        </Typography>
                        <div className="tech-grid">
                            {techStack.map((tech, index) => (
                                <div key={index} className="tech-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="tech-icon-container">
                                        {tech.iconPath ? (
                                            // Render simple-icons SVG path
                                            <svg
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                fill={tech.color}
                                                className="tech-icon"
                                            >
                                                <path d={tech.iconPath} />
                                            </svg>
                                        ) : (
                                            // Render imported SVG file
                                            <img
                                                src={tech.icon}
                                                alt={tech.name}
                                                width="48"
                                                height="48"
                                                className="tech-icon"
                                            />
                                        )}
                                    </div>
                                    <Typography variant="h6" className="tech-name">
                                        {tech.name}
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </Container>
                </section>

                {/* Second CTA Section */}
                <section className="cta-section scroll-animate" ref={ctaSectionRef}>
                    <Container maxWidth="lg">
                        <Box className="cta-content">
                            <Typography variant="h3" className="cta-title">
                                {user ? "Ready to Get Started?" : "Explore the Features"}
                            </Typography>
                            {user ? (
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="cta-button"
                                    onClick={() => navigate('/applications')}
                                >
                                    View Applications
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="cta-button"
                                    onClick={handleDemoLogin}
                                >
                                    Try the Demo
                                </Button>
                            )}
                        </Box>
                    </Container>
                </section>

                {/* Footer */}
                <footer className="footer-section">
                    <Container maxWidth="lg">
                        <Box className="footer-content">
                            <div className="footer-links">
                                <IconButton
                                    component="a"
                                    href="https://www.linkedin.com/in/jessica-richard-7b601789"
                                    target="_blank"
                                    className="footer-link"
                                    aria-label="LinkedIn Profile"
                                >
                                    <LinkedIn />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href="https://github.com/jrichard12/job-application-tracker"
                                    target="_blank"
                                    className="footer-link"
                                    aria-label="GitHub Repository"
                                >
                                    <GitHub />
                                </IconButton>
                            </div>
                            <Typography variant="body2" className="footer-text">
                                Designed and Built by Jessica Richard
                            </Typography>
                        </Box>
                    </Container>
                </footer>
            </div>
            <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
        </>
    );
}


export default Main;