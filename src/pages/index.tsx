import { GetStaticProps } from 'next';
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

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

  const [dataPost, setDataPost] = useState(results)
  const [nextUrl, setNextUrl] = useState(next_page)

  const handleLoadMoreData = async () => {
    const response = await fetch(nextUrl)

    const {
      next_page: secondPaginationNextPage,
      results: nextResults
    } = await response.json()

    setDataPost(oldValues => [
      ...oldValues,
      ...nextResults.map(post => {
        return {
          first_publication_date: new Date(post.data.last_publication_date).toLocaleDateString(
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
    ])

    setNextUrl(secondPaginationNextPage)
  }

  return (
    <>
      <Head>
        <title>Home | Posts</title>
      </Head>
      <div className={styles.container}>
        {
          dataPost.map((item, index) => (
            <Link
              key={`${index}-${item.uid}`}
              href={`/post/${item.uid}`}
              prefetch
            >
              <a>
                <div className={styles.postWrapper}>
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
              </a>
            </Link>
          ))
        }
        {
          nextUrl
          && (
            <button
              type="button"
              onClick={() => handleLoadMoreData()}
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
    Prismic.predicates.at('document.type', 'post')
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
