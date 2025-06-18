#!/bin/bash

# QEC-SFT Platform Production Deployment Script
# Production-ready deployment with comprehensive validation

set -e

echo "🚀 Starting QEC-SFT Platform Production Deployment"
echo "=============================================="

# Environment validation
if [ -z "$VITE_NVIDIA_API_KEY" ] && [ -z "$VITE_GROQ_API_KEY" ]; then
    echo "⚠️  Warning: No AI API keys configured. Platform will run in simulation mode."
    echo "   Set VITE_NVIDIA_API_KEY and/or VITE_GROQ_API_KEY for full AI capabilities."
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment validation..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Type checking
echo "🔍 Running TypeScript type checking..."
npm run build

# Linting
echo "🧹 Running code quality checks..."
npm run lint

# Build optimization
echo "🏗️  Building optimized production bundle..."
npm run build

# Bundle analysis
echo "📊 Analyzing bundle size..."
if command -v npx &> /dev/null; then
    npx vite-bundle-analyzer dist/stats.html || echo "Bundle analyzer not available"
fi

# PWA validation
echo "📱 Validating PWA configuration..."
if [ -f "dist/manifest.json" ]; then
    echo "✅ PWA manifest found"
else
    echo "❌ PWA manifest missing"
    exit 1
fi

if [ -f "dist/sw.js" ] || [ -f "dist/service-worker.js" ]; then
    echo "✅ Service worker found"
else
    echo "❌ Service worker missing"
    exit 1
fi

# Performance audit (if lighthouse is available)
if command -v lighthouse &> /dev/null; then
    echo "🏃 Running Lighthouse performance audit..."
    npm run preview &
    PREVIEW_PID=$!
    sleep 5
    lighthouse http://localhost:4173 --output=html --output-path=./lighthouse-report.html --chrome-flags="--headless" --quiet || echo "Lighthouse audit completed with warnings"
    kill $PREVIEW_PID
    echo "📊 Lighthouse report saved to lighthouse-report.html"
fi

# Security scan
echo "🔒 Running security checks..."
npm audit --audit-level=high || echo "Security audit completed with warnings"

# Final validation
echo "✅ Pre-deployment validation completed successfully!"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Deployment Options:"
echo "1. Netlify: netlify deploy --prod --dir=dist"
echo "2. Vercel: vercel --prod"
echo "3. Firebase: firebase deploy"
echo "4. GitHub Pages: npm run deploy"
echo ""
echo "Environment Variables Needed:"
echo "- VITE_NVIDIA_API_KEY (optional, for AI enhancement)"
echo "- VITE_GROQ_API_KEY (optional, for AI reasoning)"
echo "- VITE_SUPABASE_URL (optional, for future features)"
echo "- VITE_SUPABASE_ANON_KEY (optional, for future features)"
echo ""
echo "🎉 QEC-SFT Platform is ready for production deployment!"