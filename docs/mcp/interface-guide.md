# User Interface Guide

This comprehensive guide walks you through every aspect of the QEC-SFT Platform's user interface, helping you navigate efficiently and use all available features.

## 🏠 Main Dashboard Layout

### Header Section
![Header Layout](../assets/screenshots/header-layout.png)

The header contains:
- **QEC-SFT Platform Logo**: Click to return to home
- **Version Indicator**: Shows current platform version (v8.0.0)
- **Demo Mode Badge**: Indicates you're using the demonstration version
- **Navigation Tabs**: Switch between QEC Pipeline and Algorand Dashboard

### Content Area
The main content area is divided into three primary sections:
1. **Hero Section**: Welcome message and platform description
2. **Pipeline Input**: Where you enter requirements and configure analysis
3. **Results Display**: Shows analysis outcomes and generated artifacts

### Footer
Contains links to:
- Documentation and help resources
- GitHub repository and source code
- System status indicators
- Contact information

## 📝 Pipeline Input Interface

### LSU (Logical Semantic Unit) Input
![LSU Input Interface](../assets/screenshots/lsu-input.png)

**Location**: Center of the page in a prominent card
**Purpose**: Where you enter your governance requirements

**Components**:
- **Text Area**: Large, expandable input field
  - Minimum height accommodates multiple lines
  - Auto-resizes as you type
  - Character counter shows current length
  - Minimum 10 characters required for submission
- **Label**: "Logical Semantic Unit" with helpful description
- **Placeholder Text**: Example guidance for what to enter
- **Character Counter**: Shows current length and minimum requirement

**Best Practices**:
- Write clear, specific requirements
- Use complete sentences
- Include measurable criteria when possible
- Avoid overly technical jargon

### AI Enhancement Controls
![AI Controls](../assets/screenshots/ai-controls.png)

**AI-Enhanced Mode Toggle**:
- **Location**: Below the LSU input area
- **Visual Indicator**: Switch with status indicators
- **States**:
  - ✅ **Available**: Green indicator, toggle enabled
  - ❌ **Unavailable**: Red indicator, toggle disabled
  - 🔄 **Checking**: Yellow indicator, status being verified

**AI Status Display**:
- **Model Information**: Shows which AI model is active
- **Confidence Level**: AI analysis confidence percentage
- **Connection Status**: Real-time service availability
- **Performance Metrics**: Response time and capability indicators

### Action Buttons
![Action Buttons](../assets/screenshots/action-buttons.png)

**Primary Actions**:
1. **Execute Pipeline Button**:
   - Large, prominent blue button
   - Shows different text based on selected mode:
     - "Execute QEC-SFT Pipeline" (Simulation mode)
     - "Execute AI-Enhanced QEC-SFT Pipeline" (AI mode)
   - Disabled when LSU is too short or system is processing
   - Shows loading spinner during analysis

2. **Clear Results Button**:
   - Appears only when results are present
   - Clears current analysis and resets the interface
   - Requires confirmation for destructive action

3. **Test AI Connection Button**:
   - Verifies AI service availability
   - Shows loading state during testing
   - Updates AI status indicators with results

## 📊 Results Display Interface

### Status Header
![Status Header](../assets/screenshots/status-header.png)

**Success State (COHERENT)**:
- Green gradient background
- Checkmark icon
- Coherence score prominently displayed
- Processing time and metadata
- Copy and download action buttons

**Failure State (INCOHERENT)**:
- Red gradient background
- Warning triangle icon
- Fault location and recommended actions
- Risk assessment details
- Diagnostic information

**Key Metrics Displayed**:
- **Coherence Score**: Percentage indicating overall success
- **Processing Time**: How long the analysis took
- **SDE Version**: System version used for analysis
- **AI Confidence**: When AI mode is used

### Syndrome Analysis Visualization
![Syndrome Analysis](../assets/screenshots/syndrome-analysis.png)

**Visual Design**:
- Color-coded cards for each stabilizer check
- Green cards for passed checks (+1)
- Red cards for failed checks (-1)
- Detailed descriptions for each check type

**Stabilizer Check Types**:
1. **Syntax Validation**: Code structure and format verification
2. **Semantic Consistency**: Logical coherence across representations
3. **Security Analysis**: Vulnerability and threat assessment
4. **Performance Check**: Efficiency and scalability evaluation
5. **Compliance Audit**: Regulatory and standards alignment

**Interaction Features**:
- Expandable cards for detailed diagnostics
- AI-generated remediation suggestions (when available)
- Relevant artifact highlighting
- Confidence scores for each check

### Generated Artifacts
![Generated Artifacts](../assets/screenshots/artifacts.png)

**Artifact Types**:
1. **policy.rego**: Open Policy Agent policy implementation
2. **specification.tla**: TLA+ formal specification
3. **test_suite.py**: Python test cases and validation
4. **documentation.md**: Comprehensive implementation guide

**Features for Each Artifact**:
- **Syntax Highlighting**: Code appears with proper formatting
- **Copy Button**: One-click copying to clipboard
- **Download Button**: Save individual files
- **Line Numbers**: Easy reference for debugging
- **Collapsible Sections**: Manage large code blocks

### Certificate Package
![Certificate Package](../assets/screenshots/certificate.png)

**Complete JSON Output**:
- Structured JSON viewer with syntax highlighting
- Collapsible tree structure for navigation
- Search functionality for large documents
- Export options (JSON, PDF, formatted text)

**Key Sections**:
- **Payload**: Main artifact data and metadata
- **Certificate**: Formal semantic integrity certification
- **Signature**: Cryptographic verification data

## 🔧 Advanced Features

### Navigation Tabs
![Navigation Tabs](../assets/screenshots/navigation.png)

**QEC Pipeline Tab** (Default):
- Main analysis interface
- LSU input and results display
- AI enhancement controls

**Algorand Dashboard Tab**:
- Blockchain integration tools
- Account lookup and analysis
- Smart contract compilation
- Network status monitoring

### Mobile Interface
![Mobile Interface](../assets/screenshots/mobile.png)

**Responsive Design Features**:
- Stacked layout for narrow screens
- Touch-optimized buttons and controls
- Swipe gestures for navigation
- Collapsible sections to save space

**Mobile-Specific Optimizations**:
- Larger touch targets
- Simplified navigation
- Reduced visual clutter
- Optimized text sizes

### Dark Mode (Auto-detected)
![Dark Mode](../assets/screenshots/dark-mode.png)

The platform automatically adapts to your system's dark mode preference:
- Dark backgrounds with light text
- Adjusted accent colors for better contrast
- Consistent theming across all components
- Reduced eye strain for extended use

## 🎛️ Settings and Preferences

### Analysis Configuration
**Available Options**:
- **AI Enhancement**: Toggle advanced AI analysis
- **Artifact Generation**: Control which files are created
- **Verbose Output**: Include detailed diagnostic information
- **Risk Assessment**: Enable comprehensive security evaluation

### Display Preferences
**Customization Options**:
- **Theme**: Light, dark, or system-based
- **Code Highlighting**: Choose syntax highlighting themes
- **Layout Density**: Compact or comfortable spacing
- **Animation**: Enable or disable transitions

## 📱 Keyboard Shortcuts

### Global Shortcuts
- **Ctrl/Cmd + Enter**: Execute pipeline analysis
- **Ctrl/Cmd + K**: Focus on LSU input field
- **Ctrl/Cmd + R**: Clear current results
- **Ctrl/Cmd + D**: Download current results
- **Escape**: Close any open modals or expanded sections

### Code Editor Shortcuts
- **Ctrl/Cmd + A**: Select all code in viewer
- **Ctrl/Cmd + C**: Copy selected code
- **Ctrl/Cmd + F**: Find text within code
- **F11**: Fullscreen code viewer

## 🔍 Search and Filter

### Result Filtering
When multiple analyses are available:
- **Filter by Status**: Show only COHERENT or INCOHERENT results
- **Filter by Date**: Limit to specific time periods
- **Filter by AI Mode**: Separate AI-enhanced from simulation results
- **Search LSU Text**: Find analyses by requirement content

### Artifact Search
Within generated artifacts:
- **Text Search**: Find specific code or documentation
- **Symbol Search**: Locate functions, variables, or definitions
- **Cross-Reference**: Find related items across artifacts

## 💡 Tips for Efficient Navigation

### Quick Actions
1. **Tab Navigation**: Use Tab and Shift+Tab to move between elements
2. **Enter Key**: Quickly submit forms and confirm actions
3. **Escape Key**: Cancel operations or close overlays
4. **Arrow Keys**: Navigate through result lists and code blocks

### Visual Cues
- **Loading Indicators**: Animated spinners show processing status
- **Color Coding**: Green (success), red (error), yellow (warning), blue (info)
- **Icons**: Consistent iconography for different action types
- **Status Badges**: Quick visual indicators for AI availability and system health

### Accessibility Features
- **Screen Reader Support**: All content is properly labeled
- **High Contrast Mode**: Automatic adjustment for visual accessibility
- **Keyboard Navigation**: Full functionality without mouse
- **Focus Indicators**: Clear visual focus for keyboard users

## 🚨 Error States and Recovery

### Common Error Indicators
![Error States](../assets/screenshots/errors.png)

**Network Errors**:
- Red banner at top of screen
- Automatic retry mechanisms
- Offline mode indicators

**Validation Errors**:
- Inline error messages
- Highlighted problematic fields
- Suggested corrections

**System Errors**:
- Friendly error messages
- Contact information for support
- Error code for technical support

### Recovery Actions
1. **Refresh Page**: Ctrl/Cmd + R to reload
2. **Clear Cache**: Force fresh data loading
3. **Check Connection**: Verify internet connectivity
4. **Try Again**: Retry failed operations
5. **Contact Support**: Built-in feedback mechanisms

## 📞 Getting Help

### In-Interface Help
- **Tooltips**: Hover over elements for quick explanations
- **Help Icons**: Click for contextual assistance
- **Status Messages**: Real-time feedback on actions
- **Progress Indicators**: Show what's happening during processing

### External Resources
- **Documentation Links**: Quick access to detailed guides
- **Video Tutorial Buttons**: Launch relevant video content
- **Community Forum Links**: Connect with other users
- **Support Contact**: Direct access to technical support

This interface guide provides a comprehensive overview of the QEC-SFT Platform's user interface. For specific feature details, see our [Feature Documentation](./features.md), or for help with common issues, check our [Troubleshooting Guide](./troubleshooting.md).