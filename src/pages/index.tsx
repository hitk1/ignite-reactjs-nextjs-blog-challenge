import { GetStaticProps } from 'next';
import Head from 'next/head'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination: { next_page, results } }: HomeProps) {

  return (
    <>
      <Head>
        <title>Home | Posts</title>
      </Head>
      <div className={styles.container}>
        {
          results.map(item => (
            <div
              key={item.uid}
              className={styles.postWrapper}
            >
              <strong className={styles.title}>{item.data.title}</strong>
              <p className={styles.subtitle}>{item.data.subtitle}</p>

              <div className={styles.contentWrapper}>
                <div>
                  <FiCalendar
                    color="#bbbbbb"
                    size={22}
                  />
                  <time>{item.first_publication_date}</time>
                </div>
                <div>
                  <FiUser
                    color="#bbbbbb"
                    size={22}
                  />
                  <p>{item.data.author}</p>
                </div>
              </div>
            </div>
          ))
        }
        {
          next_page
          && (
            <button
              type="button"
              onClick={() => alert("test")}
            >
              Carregar mais posts
            </button>
          )
        }
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1
    }
  )

  const posts = postsResponse.results.map(post => {
    return {
      first_publication_date: new Date(post.last_publication_date).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }
      ),
      uid: post.uid,
      data: {
        author: RichText.asText(post.data.author),
        subtitle: RichText.asText(post.data.subtitle),
        title: RichText.asText(post.data.title),
      }
    } as Post
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page
      }
    }
  }
};
