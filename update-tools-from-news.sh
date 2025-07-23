#!/bin/bash

# News to Tools Automation Workflow
# This script processes newsletters and automatically updates the tools database

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_SCRIPT="$SCRIPT_DIR/scripts/news-to-tools-workflow.js"
EXTRACTOR_SCRIPT="$SCRIPT_DIR/scripts/news-tool-extractor-enhanced.js"
INTEGRATOR_SCRIPT="$SCRIPT_DIR/scripts/auto-integrate-tools.js"

# Use original extractor if enhanced doesn't exist
if [ ! -f "$EXTRACTOR_SCRIPT" ]; then
    EXTRACTOR_SCRIPT="$SCRIPT_DIR/scripts/news-tool-extractor.js"
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo "📰 AI News to Tools Automation"
    echo "=============================="
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  latest                Process the most recent newsletter"
    echo "  process <file>        Process a specific newsletter file"
    echo "  process-all           Process all newsletters in the directory"
    echo "  watch                 Watch for new newsletters (continuous)"
    echo "  manual <file>         Process with manual review steps"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 latest"
    echo "  $0 process data/Newsletters/7-20-2025.txt"
    echo "  $0 watch"
}

# Function to check dependencies
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        exit 1
    fi
    
    if [ ! -f "$WORKFLOW_SCRIPT" ]; then
        echo -e "${RED}Error: Workflow script not found at $WORKFLOW_SCRIPT${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All dependencies satisfied${NC}"
}

# Function for manual review process
manual_review() {
    local newsletter_file=$1
    
    echo -e "${BLUE}Starting manual review process...${NC}"
    
    # Step 1: Extract tools
    echo -e "\n${YELLOW}Step 1: Extracting tools from newsletter${NC}"
    node "$EXTRACTOR_SCRIPT" "$newsletter_file"
    
    # Show extraction results
    echo -e "\n${BLUE}Extraction complete. Review the results:${NC}"
    cat "$SCRIPT_DIR/data/extracted-tools-batch.json" | node -e "
        const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
        console.log('New tools found:', data.newTools.length);
        console.log('Updates found:', data.updates.length);
        console.log('\nNew tools:');
        data.newTools.forEach(t => console.log('  -', t.name, '(confidence:', (t.confidence * 100).toFixed(0) + '%)'));
        console.log('\nUpdates:');
        data.updates.forEach(u => console.log('  -', u.tool_name));
    "
    
    # Ask for confirmation
    echo -e "\n${YELLOW}Do you want to proceed with integration? (y/n)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Proceeding with integration...${NC}"
        node "$INTEGRATOR_SCRIPT"
        echo -e "${GREEN}✓ Integration complete!${NC}"
    else
        echo -e "${YELLOW}Integration cancelled.${NC}"
    fi
}

# Main script logic
main() {
    check_dependencies
    
    case "$1" in
        latest)
            echo -e "${BLUE}Processing latest newsletter...${NC}"
            node "$WORKFLOW_SCRIPT" latest
            ;;
        
        process)
            if [ -z "$2" ]; then
                echo -e "${RED}Error: Please specify a newsletter file${NC}"
                show_help
                exit 1
            fi
            echo -e "${BLUE}Processing $2...${NC}"
            node "$WORKFLOW_SCRIPT" process "$2"
            ;;
        
        process-all)
            echo -e "${BLUE}Processing all newsletters...${NC}"
            node "$WORKFLOW_SCRIPT" process-all
            ;;
        
        watch)
            echo -e "${BLUE}Starting watch mode...${NC}"
            echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
            node "$WORKFLOW_SCRIPT" watch
            ;;
        
        manual)
            if [ -z "$2" ]; then
                echo -e "${RED}Error: Please specify a newsletter file${NC}"
                show_help
                exit 1
            fi
            manual_review "$2"
            ;;
        
        help|--help|-h)
            show_help
            ;;
        
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"