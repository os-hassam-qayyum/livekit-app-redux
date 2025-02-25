import { trigger, transition, style, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VideoBookMark } from '../models/video-player.model';

declare global {
  interface Window {
    MathJax: any;
  }
}
@Component({
  selector: 'app-meeting-notes',
  templateUrl: './meeting-notes.component.html',
  styleUrls: ['./meeting-notes.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class MeetingNotesComponent {
  hintVisibility: boolean[] = [];
  currentIndex = 0;
  currentTime = 0;
  activeBookmark: VideoBookMark | undefined;
  isModalOpen = false;
  bookmarkForm: FormGroup;
  notesList = [
    {
      id: 106,
      type: 'walkthrough',
      data: {
        id: 'walkthroughId',
        steps: [
          {
            content: 'Define the function',
            media: {
              type: 'img',
              file: {
                url: 'https://images.pexels.com/photos/707915/pexels-photo-707915.jpeg',
                title: 'Function Evaluation Graph',
              },
            },
            annotation:
              'The function is given as $$ f(x) = (x - 3)^2 + 8 $$ for $$ -1 < x < 9 $$.',
            hint: 'Identify the function type and its domain.',
          },
          {
            content: 'Determine the shape of the function',
            media: {
              type: 'img',
              file: {
                url: 'https://images.pexels.com/photos/707915/pexels-photo-707915.jpeg',
                title: 'Function Evaluation Graph',
              },
            },
            annotation:
              'Since the function is a quadratic with a positive coefficient, it forms a parabola opening upwards.',
            hint: 'Quadratic functions of the form $$ a(x - h)^2 + k $$ have a minimum at $$ (h, k) $$.',
          },
          {
            content: 'Find the minimum point',
            media: {
              type: 'img',
              file: {
                url: 'https://images.pexels.com/photos/707915/pexels-photo-707915.jpeg',
                title: 'Function Evaluation Graph',
              },
            },
            annotation:
              'The minimum occurs at $$ x = 3 $$, where $$ f(3) = 8 $$, so the vertex is at $$ (3, 8) $$.',
            hint: 'Set the squared term to zero to find the minimum value.',
            textContent:
              'This is text type of walkthrough, Define the function',
          },
          {
            content: 'Evaluate function at domain endpoints',
            media: {
              type: 'img',
              file: {
                url: 'https://images.pexels.com/photos/707915/pexels-photo-707915.jpeg',
                title: 'Function Evaluation Graph',
              },
            },
            annotation:
              'Calculate $$ f(-1) = (-1 - 3)^2 + 8 = 24 $$ and $$ f(9) = (9 - 3)^2 + 8 = 44 $$.',
            hint: 'Substituting endpoint values helps determine range limits.',
          },
          {
            content: 'Sketch the graph',
            media: {
              type: 'video',
              file: {
                url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                title: 'Graph Sketching Tutorial',
              },
            },
            annotation:
              'Plot the points $$ (-1, 24) $$, $$ (3, 8) $$, and $$ (9, 44) $$ and draw a parabola through them.',
            hint: 'Ensure the parabola is symmetric around $$ x = 3 $$.',
          },
          {
            content: 'Determine the range',
            media: {
              type: 'audio',
              file: {
                url: '../../assets/prism-of-darkness-funny-hip-hop-background-music-for-video-full-ver-291300.mp3',
                title: 'Range Explanation Audio',
              },
            },
            annotation:
              'Since the minimum value is 8 and the function increases from there, the range is $$ 8 < f(x) < 44 $$.',
            hint: 'The range is determined by the lowest and highest function values in the given domain.',
          },
        ],
      },
    },
    {
      id: 101,
      type: 'text',
      content:
        'Welcome to the LMS! This guide will help you get started. Lorem Ipsum is simply dummy text...',
      file: null,
    },
    {
      id: 102,
      type: 'img',
      content: '',
      file: {
        id: 201,
        url: 'https://images.pexels.com/photos/707915/pexels-photo-707915.jpeg',
        title: 'Welcome Screen',
      },
    },
    {
      id: 103,
      type: 'text',
      content:
        'Welcome to the LMS! This guide will help you get started. Lorem Ipsum is simply dummy text...',
      file: null,
    },
    {
      id: 104,
      type: 'video',
      content: '',
      file: {
        id: 202,
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        title: 'Getting Started Video',
      },
      enforceBookmarks: [true, false, false, true, true],
      bookmarks: [
        { from: 0, to: 120, description: 'Intro' },
        { from: 120, to: 190, description: 'SI Units' },
        { from: 190, to: 320, description: 'Kinematics' },
        { from: 320, to: 450, description: 'Magnetism' },
        { from: 450, to: 600, description: 'Electricity' },
      ],
    },
    {
      id: 105,
      type: 'audio',
      content: '',
      file: {
        id: 203,
        url: '../../assets/prism-of-darkness-funny-hip-hop-background-music-for-video-full-ver-291300.mp3',
        title: 'Audio Guide',
      },
    },
  ];

  enforceBookmarks =
    this.notesList.find((item) => item.type === 'video')?.enforceBookmarks ||
    [];

  constructor(private formBuilder: FormBuilder) {}
  ngOnInit(): void {
    this.bookmarkForm = this.formBuilder.group({
      description: ['', [Validators.required]],
      from: [0, [Validators.required, Validators.min(0)]],
      to: [0, [Validators.required, Validators.min(0)]],
    });
  }
  ngAfterViewInit(): void {
    this.renderMath();
  }

  ngAfterViewChecked(): void {
    this.renderMath();
  }
  nextStep(item: any) {
    if (this.currentIndex < item.data.steps.length - 1) {
      this.currentIndex++;
    }
  }
  toggleHint(index: number, event: Event) {
    this.hintVisibility[index] = (event.target as HTMLInputElement).checked;
  }
  openAddBookmarkModal() {
    this.isModalOpen = true;
  }

  renderMath(): void {
    if (window.MathJax) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
    }
  }

  // Close the modal

  // Close the modal
  closeModal() {
    this.isModalOpen = false;
    this.bookmarkForm.reset();
  }

  addBookmark(item: any) {
    if (this.bookmarkForm.valid && item.type === 'video') {
      const newBookmark: VideoBookMark = this.bookmarkForm.value;

      // Ensure bookmarks array exists
      if (!item.bookmarks) {
        item.bookmarks = [];
      }

      // Ensure enforceBookmarks array exists
      if (!item.enforceBookmarks) {
        item.enforceBookmarks = [];
      }

      // Add new bookmark
      item.bookmarks.push(newBookmark);
      item.enforceBookmarks.push(false); // or true if you want it enabled by default

      // Close the modal and reset the form
      this.closeModal();
    }
  }

  selectBookmark(bookmark: VideoBookMark): void {
    if (this.activeBookmark === bookmark) {
      this.activeBookmark = undefined;
    } else {
      this.activeBookmark = bookmark;
    }
  }
  formatBookmarkDescription(bookmark: {
    from: number;
    to: number;
    description: string;
  }): string {
    const fromTime = this.formatTime(bookmark.from);
    const toTime = this.formatTime(bookmark.to);
    return `${bookmark.description} (${fromTime} - ${toTime})`;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  updateCurrentTime(time: number): void {
    this.currentTime = time;
    console.log('time', time);
  }
}
